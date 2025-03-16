import { sendError } from "@/utils/response"
import { createMiddleware } from "hono/factory"

export const withErrorHandler = createMiddleware(async (c, next) => {
	try {
		await next()
	} catch (err) {
		return sendError(c, err)
	}
})
