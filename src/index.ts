import { makeApp } from "@/app"
import { parseEnvironment } from "@/utils/environment"

const env = parseEnvironment(process.env)
if (!env) {
	process.exit(1)
}

const app = makeApp(env)

export default {
	port: env.PORT,
	fetch: app.fetch,
}
