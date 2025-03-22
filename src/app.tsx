import { Homepage } from "@/ui/home"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { poweredBy } from "hono/powered-by"
import { prettyJSON } from "hono/pretty-json"
import { requestId } from "hono/request-id"
import { secureHeaders } from "hono/secure-headers"
import { timing } from "hono/timing"
import { trimTrailingSlash } from "hono/trailing-slash"

import { withErrorHandler } from "@/middlewares/with-error-handler"
import { withLayout } from "@/middlewares/with-layout"
import type { AppEnv } from "@/types"
import { ErrorDetails } from "@/ui/error-details"
import { ENVIRONMENT } from "@/utils/environment"
import { AppError, ErrorCodes } from "@/utils/error"
import { sendError } from "@/utils/response"

import { imagesApi } from "@/modules/images/api"
import { usernamesApi } from "@/modules/usernames/api"

export type AppType = typeof app
export const app = new Hono<AppEnv>()
	/////// Middleware
	.use(requestId())
	.use(logger())
	.use(timing())
	.use(prettyJSON())
	.use(poweredBy())
	.use(trimTrailingSlash())
	.use(secureHeaders())
	.use(withLayout())

	/////// Error Handling
	.onError((err, c) => sendError(c, err))
	.notFound((c) => {
		const error = new AppError(
			ErrorCodes.NOTFOUND_ERROR,
			"Ooops! That page doesn't seem to exist.",
		)

		c.status(404)
		return c.render(<ErrorDetails err={error} />, { title: "Not Found" })
	})

	/////// Static Assets
	.use(
		serveStatic({
			root: "public",
			precompressed: true,
			onFound: (_path, c) => {
				c.header("Cache-Control", "public, immutable, max-age=31536000")
			},
		}),
	)

	/////// Status
	.get("/health", (c) => c.text("ok"))
	.get("/ping", (c) => c.text("pong"))

	/////// API
	.use("/api/*", cors({ origin: ENVIRONMENT.ALLOWED_ORIGINS }))
	.use("/api/*", withErrorHandler)
	.route("/api/v1/images", imagesApi)
	.route("/api/v1/usernames", usernamesApi)

	/////// Pages
	.get("/t/:tool", (c) => {
		const { tool } = c.req.param()
		return c.redirect(`/tools/${tool}`)
	})
	.get("/tools/:tool", (c) => {
		const { tool } = c.req.param()

		return c.render(<div id="root" />, {
			title: tool.toLocaleUpperCase(),
			stylesheets: [`/static/styles/tools/${tool}.css`],
			scripts: [`/tools/${tool}/entry.js`],
		})
	})
	.get("/", async (c) => {
		return c.render(<Homepage />, {
			title: "Kuhree's Web Toolbox",
			subtitle: "A collection of tools. No logging, no ads, just solutions.",
			header: { enabled: false, back: null, links: null },
			stylesheets: ["/static/styles/homepage.css"],
		})
	})

/////// Dynamically build `tools` entrypoints when not in production
if (ENVIRONMENT.NODE_ENV !== "production") {
	app.get("/tools/:tool/entry.js", withErrorHandler, async (c) => {
		const { tool } = c.req.param()
		const file = await Bun.build({
			entrypoints: [`src/modules/${tool}/entry.tsx`],
		})

		const outputPromises = file.outputs.map((o) => o.text())
		const outputTexts = await Promise.all(outputPromises)
		return c.body(outputTexts.join("\r\n"), 200, {
			"Content-Type": "application/javascript",
			"Cache-Control": "public, immutable, max-age=31536000",
		})
	})
}
