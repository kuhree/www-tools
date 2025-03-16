import type { AppEnv } from "@/types"
import { sendError } from "@/utils/response"
import { zValidator } from "@hono/zod-validator"
import { spawn } from "bun"
import { Hono } from "hono"
import { stream } from "hono/streaming"
import { z } from "zod"

export type PlatformResult = {
	id: string
	message: string
	available: boolean
	url: string | null
}

export const usernamesApi = new Hono<AppEnv>()

usernamesApi.get(
	"/:username",
	zValidator(
		"param",
		z.object({
			username: z.string().min(1).max(64),
		}),
		(result, c) => {
			if (result.success) return
			return sendError(c, result.error)
		},
	),
	(c) => {
		const { username } = c.req.valid("param")

		const process = spawn({
			cmd: [
				"sherlock",
				"--csv",
				"--print-all",
				"--timeout",
				"5",
				"--folderoutput",
				`public/sherlock/${username}`,
				username,
			],
			stdout: "pipe",
			stderr: "pipe",
		})

		return stream(
			c,
			async (stream) => {
				const stdoutReader = process.stdout.getReader()
				const stderrReader = process.stderr.getReader()
				const decoder = new TextDecoder()
				let stdoutBuffer = ""

				stream.onAbort(() => {
					console.warn("Stream aborted! Killing process...")
					process.kill()
				})

				const processStdout = async () => {
					const testRegex = /^\[([\+\-])\]\s*(.+?):\s*(.+)$/
					const lineToJson = (line: string): PlatformResult | undefined => {
						const match = line.match(testRegex)
						if (match) {
							const symbol = match[1]
							const platform = match[2]?.trim()
							const maybeURL = match[3]?.trim()
							const available = symbol === "-"

							const jsonObj: PlatformResult = {
								id: platform ?? "unknown",
								available,
								message: "Found!",
								url: null,
							}

							if (maybeURL?.startsWith("http")) {
								jsonObj.url = maybeURL
							} else if (maybeURL) {
								jsonObj.message = maybeURL
							}

							return jsonObj
						}
					}

					while (true) {
						const { done, value } = await stdoutReader.read()
						if (done) break

						stdoutBuffer += decoder.decode(value, { stream: true })

						let newlineIndex: number = stdoutBuffer.indexOf("\n")
						while (newlineIndex >= 0) {
							const line = stdoutBuffer.slice(0, newlineIndex).trim()
							stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1)

							const jsonObj = lineToJson(line)
							if (jsonObj) {
								stream.write(Buffer.from(`${JSON.stringify(jsonObj)}\n`))
							}

							newlineIndex = stdoutBuffer.indexOf("\n")
						}
					}

					if (stdoutBuffer.trim().length > 0) {
						const jsonObj = lineToJson(stdoutBuffer.trim())
						if (jsonObj) {
							stream.write(Buffer.from(`${JSON.stringify(jsonObj)}\n`))
						}
					}
				}

				const processStderr = async () => {
					let errorBuffer = ""

					while (true) {
						const { done, value } = await stderrReader.read()
						if (done) break
						errorBuffer += decoder.decode(value, { stream: true })
					}

					if (errorBuffer.trim()) {
						const cleanedError = errorBuffer
							.split("\n")
							.filter((line) => line.startsWith("sherlock: error:"))
							.join(" ")
							.replace(/sherlock: error: /, "")
							.trim()

						stream.write(
							Buffer.from(`${JSON.stringify({ error: cleanedError })}\n`),
						)
					}
				}

				await Promise.all([processStdout(), processStderr()])
			},
			async (err, stream) => {
				stream.writeln(JSON.stringify({ error: "An error occured!" }))
				console.error("Stream error:", err)
			},
		)
	},
)
