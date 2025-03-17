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

import { withErrorHandler } from "@/middlewares/error"
import { withLayout } from "@/middlewares/renderer"
import type { AppEnv } from "@/types"
import { ErrorDetails } from "@/ui/error-details"
import type { Environment } from "@/utils/environment"
import { AppError, ErrorCodes } from "@/utils/error"
import { sendError } from "@/utils/response"

import { imagesApi } from "@/modules/images/api"
import { usernamesApi } from "@/modules/usernames/api"

export type AppType = ReturnType<typeof makeApp>
export function makeApp(environment: Environment) {
	const app = new Hono<AppEnv>()
		/////// Middleware
		.use(requestId())
		.use(logger())
		.use(timing())
		.use(prettyJSON())
		.use(poweredBy())
		.use(trimTrailingSlash())
		.use(secureHeaders())
		.use(withLayout)

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
		.use("/api/*", withErrorHandler)
		.use("/api/*", cors({ origin: environment.ALLOWED_ORIGINS }))
		.route("/api/v1/images", imagesApi)
		.route("/api/v1/usernames", usernamesApi)

		/////// Pages
		.get("/tools/:tool", (c) => {
			const { tool } = c.req.param()
			return c.render(
				<>
					<div id="root" />
					<link
						type="text/css"
						rel="stylesheet"
						href={`/static/styles/tools/${tool}.css`}
					/>
					<script type="text/javascript" src={`/tools/${tool}/entry.js`} />
				</>,
				{ title: tool.toLocaleUpperCase() },
			)
		})
		.get("/", async (c) => {
			return c.render(
				<>
					<h2>All Tools</h2>
					<div class="subnav">
						<a href="/tools/usernames">Username Search</a>
						<a href="/tools/images">Image Optimizer</a>
						<a href="/tools/webcams">Webcam Tester</a>
					</div>

					<h2>More coming soon...</h2>
					<ul>
						<li>
							<a
								href={encodeURI(
									`${environment.REPO_URL}/issues/new?title=[Feature Request]`,
								)}
							>
								Submit a request
							</a>
						</li>
						<li>
							<a
								href={encodeURI(
									`${environment.REPO_URL}/issues/new?title=[Issue]`,
								)}
							>
								File an issue
							</a>
						</li>
						<li>
							<a href={`mailto:${environment.AUTHOR_EMAIL}`}>Get in touch</a>
						</li>
					</ul>
				</>,
				{
					title: "Kuhree's Web Toolbox",
					subtitle:
						"A collection of tools. No logging, no ads, just solutions.",
					header: { enabled: false, back: null, links: null },
				},
			)
		})

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

	/////// Dynamic build route for development ONLY
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

	return app
}
