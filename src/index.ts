import { makeApp } from "@/app"
import { parseEnvironment } from "@/utils/environment"

const environment = parseEnvironment(process.env)
if (!environment) {
	process.exit(1)
}

const app = makeApp(environment)

export default {
	port: environment.PORT,
	fetch: app.fetch,
}
