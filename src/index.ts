import { makeApp } from "@/app"
import { parseEnvironment } from "@/utils/environment"

const env = parseEnvironment(process.env)
if (!env) {
	process.exit(1)
}

process.on("SIGINT", () => {
	console.warn("Received SIGINT, shutting down...")
	process.exit(0)
})

const app = makeApp(env)

export default {
	port: env.PORT,
	fetch: app.fetch,
}
