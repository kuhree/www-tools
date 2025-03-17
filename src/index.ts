import { makeApp } from "@/app"
import { parseEnvironment } from "@/utils/environment"
import { withShutdown } from "@/utils/with-shutdown"

const env = parseEnvironment(process.env)
if (!env) {
	process.exit(1)
}

withShutdown(
	Bun.serve({
		port: env.PORT,
		fetch: makeApp(env).fetch,
	}),
)

console.log("[SERVER] :: Started", { port: env.PORT })
