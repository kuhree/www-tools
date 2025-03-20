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
		const entryCss = `/static/styles/tools/${tool}.css`
		const entryJs = `/tools/${tool}/entry.js`

		return c.render(
			<>
				<div id="root" />
				<link type="text/css" rel="stylesheet" href={entryCss} />
				<script type="text/javascript" src={entryJs} />
			</>,
			{ title: tool.toLocaleUpperCase() },
		)
	})
	.get("/", async (c) => {
		const contactLinks = [
			[
				"Submit a request",
				encodeURI(`${ENVIRONMENT.REPO_URL}/issues/new?title=[Request]`),
			],
			[
				"Report an issue",
				encodeURI(`${ENVIRONMENT.REPO_URL}/issues/new?title=[Issue]`),
			],
			["Get in Touch", `mailto:${ENVIRONMENT.AUTHOR_EMAIL}`],
		]

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
					{contactLinks.map(([text, href]) => (
						<li key={href}>
							<a href={href}>{text}</a>
						</li>
					))}
				</ul>
			</>,
			{
				title: "Kuhree's Web Toolbox",
				subtitle: "A collection of tools. No logging, no ads, just solutions.",
				header: { enabled: false, back: null, links: null },
			},
		)
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
