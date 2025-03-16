import { ErrorDetails } from "@/ui/error-details"
import { createMiddleware } from "hono/factory"

export const withErrorHandler = createMiddleware(async (c, next) => {
	await next()
	if (c.error) {
		const error =
			c.error instanceof Error
				? c.error
				: new Error("Internal Server Error", { cause: c.error })

		c.status(500)
		return c.render(<ErrorDetails error={error} />, {
			title: `Error: ${error.message}`,
		})
	}
})
