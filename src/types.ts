import type { Environment } from "@/utils/environment"
import type { RequestIdVariables } from "hono/request-id"

export type AppEnv = {
	Variables: RequestIdVariables & {
		environment: <K extends keyof Environment>(
			key: K,
		) => undefined | Environment[K]
	}
}
