import type { Server } from "bun"

export function withShutdown(server: Server) {
	const shutdown = (signal: NodeJS.Signals) => {
		console.warn(`[PROCESS] :: Received ${signal}, shutting down...`)

		const timeout = setTimeout(() => {
			console.error("[PROCESS] :: Graceful shutdown timed out. Forcing exit.")
			process.exit(1)
		}, 5000)

		server
			.stop()
			.then(() => {
				clearTimeout(timeout)
				console.log("[SERVER] :: Closed")
				process.exit(0)
			})
			.catch((error) => {
				clearTimeout(timeout)
				console.error("[SERVER] :: Error closing:", error)
				process.exit(1)
			})
	}

	process.on("SIGINT", shutdown)
	process.on("SIGTERM", shutdown)
	process.on("exit", (code) => {
		console.log(`[PROCESS] :: Exiting with code ${code}`)
	})

	return server
}
