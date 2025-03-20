import { app } from "@/app"
import { ENVIRONMENT } from "@/utils/environment"
import { withShutdown } from "@/utils/with-shutdown"

withShutdown(
	Bun.serve({
		port: ENVIRONMENT.PORT,
		fetch: app.fetch,
	}),
)

console.log("[SERVER] :: Started")
