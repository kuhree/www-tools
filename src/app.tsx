import { withErrorHandler } from "@/middlewares/error-handler"
import { withLayout } from "@/middlewares/renderer"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { logger } from "hono/logger"
import { poweredBy } from "hono/powered-by"
import { prettyJSON } from "hono/pretty-json"
import { secureHeaders } from "hono/secure-headers"
import { timing } from "hono/timing"
import { trimTrailingSlash } from "hono/trailing-slash"

import type { Environment } from "@/utils/environment"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

export function createApp(env: Environment): Hono {
	const app = new Hono()

	app.use(logger())
	app.use(timing())
	app.use(prettyJSON())
	app.use(poweredBy())
	app.use(trimTrailingSlash())
	app.use(secureHeaders())
	app.use(withErrorHandler)
	app.use(withLayout)
	app.use(
		serveStatic({
			root: "public",
			precompressed: true,
			onFound: (_path, c) => {
				c.header("Cache-Control", "public, immutable, max-age=31536000")
			},
		}),
	)

	/////// API
	app.get("/health", (c) => c.text("ok"))
	app.get("/ping", (c) => c.text("pong"))

	////// Pages
	app.get(
		"/",
		zValidator(
			"query",
			z.object({
				search: z.string().min(1).optional(),
			}),
		),
		async (c) => {
			const { search } = c.req.valid("query")

			return c.render(
				<>
					<div class="subnav">
						<a href="/settings"> Settings </a>
					</div>

					<h2>All Tools</h2>
				</>,
				{
					title: "Homepage",
					subtitle:
						"A collection of tools. No logging, no ads, just solutions.",
					header: { enabled: true, back: null, links: null },
				},
			)
		},
	)

	return app
}
