import { beforeEach, describe, expect, it } from "bun:test"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"

import { withErrorHandler } from "@/middlewares/with-error-handler"
import { AppError, ErrorCodes } from "@/utils/error"
import { requestId } from "hono/request-id"
import { z } from "zod"
import { sendError } from "./response"

describe("Error Handling Middleware", () => {
	let app: Hono

	beforeEach(() => {
		app = new Hono()
			.use(requestId())
			.use(withErrorHandler)
			.onError((err, c) => sendError(c, err))
	})

	it("should catch and format AppError", async () => {
		app.get("/test", (c) => {
			throw new AppError(ErrorCodes.NOTFOUND_ERROR, "Test AppError", {
				details: "Some details",
			})
		})

		const res = await app.request("/test")
		const body = await res.json()

		expect(res.status).toBe(404)
		expect(body).toEqual({
			meta: {
				requestId: expect.stringContaining("-"),
				timestamp: expect.stringContaining("-"),
			},
			success: false,
			error: {
				name: "NOTFOUND_ERROR",
				status: 404,
				code: "NOTFOUND_ERROR",
				message: "Test AppError",
				details: { details: "Some details" },
			},
		})
	})

	it("should catch and format HTTPException", async () => {
		app.get("/test", (c) => {
			throw new HTTPException(401, { message: "Test HTTPException" })
		})

		const res = await app.request("/test")
		const body = await res.json()

		expect(res.status).toBe(401)
		expect(body).toEqual({
			meta: {
				requestId: expect.stringContaining("-"),
				timestamp: expect.stringContaining("-"),
			},
			success: false,
			error: {
				name: "INTERNAL_ERROR",
				status: 401,
				code: "INTERNAL_ERROR",
				message: "Test HTTPException",
			},
		})
	})

	it("should catch and format generic Error", async () => {
		app.get("/test", (c) => {
			throw new Error("Test generic Error")
		})

		const res = await app.request("/test")
		const body = await res.json()

		expect(res.status).toBe(500)
		expect(body).toEqual({
			meta: {
				requestId: expect.stringContaining("-"),
				timestamp: expect.stringContaining("-"),
			},
			success: false,
			error: {
				name: "INTERNAL_ERROR",
				status: 500,
				code: "INTERNAL_ERROR",
				message: "Test generic Error",
			},
		})
	})

	it("should handle ZodError and return a 500 status", async () => {
		app.get("/test", (c) => {
			const schema = z.object({
				name: z.string(),
				age: z.number(),
			})

			schema.parse({ name: "John" })
			return c.text("OK")
		})

		const res = await app.request("/test")
		const body = await res.json()

		expect(res.status).toBe(400)
		expect(body).toEqual({
			meta: {
				requestId: expect.stringContaining("-"),
				timestamp: expect.stringContaining("-"),
			},
			success: false,
			error: {
				name: "VALIDATION_ERROR",
				status: 400,
				code: "VALIDATION_ERROR",
				message: "Validation failed",
				details: expect.anything(), // ZodError details are complex, just check it's an object
			},
		})
	})
})
