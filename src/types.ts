import type { RequestIdVariables } from "hono/request-id"
import type { Environment } from "./utils/environment"

export type AppEnv = {
	Variables: RequestIdVariables & {
		environment: <K extends keyof Environment>(
			key: K,
		) => undefined | Environment[K]
	}
}
