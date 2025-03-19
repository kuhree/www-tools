import { toAppError } from "@/utils/error"
import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "zod"

type ApiMeta = z.infer<typeof ApiMetaSchema>
const ApiMetaSchema = z.object({
	requestId: z.string(),
	timestamp: z.string().default(() => new Date().toISOString()),
})

export type ApiSuccessResponse<T = unknown> = z.infer<
	typeof ApiSuccessSchema
> & {
	data: T
}
const ApiSuccessSchema = z.object({
	meta: ApiMetaSchema,
	success: z.literal(true),
	message: z.string().optional(),
	data: z.any().optional(),
})

type ApiErrorResponse = z.infer<typeof ApiErrorSchema>
const ApiErrorSchema = z.object({
	meta: ApiMetaSchema,
	success: z.literal(false),
	error: z.object({
		code: z.string(),
		message: z.string(),
		details: z.any().optional(),
	}),
})

function createSuccessResponse<T>(
	requestId: string,
	data: T,
	message?: string,
): ApiSuccessResponse<T> {
	return {
		meta: {
			requestId,
			timestamp: new Date().toISOString(),
		},

		success: true,
		message,
		data,
	}
}

function createErrorResponse(
	requestId: string,
	error: ApiErrorResponse["error"],
): ApiErrorResponse {
	return {
		meta: {
			requestId,
			timestamp: new Date().toISOString(),
		},

		success: false,
		error,
	}
}

export function sendSuccess<T>(
	c: Context,
	data: T,
	status: ContentfulStatusCode = 200,
) {
	const requestId = c.get("requestId")
	return c.json(createSuccessResponse(requestId, data), status)
}

export function sendError(c: Context, err: unknown) {
	const requestId = c.get("requestId")
	const error = toAppError(err)
	// TODO: Send to Sentry? Or, other
	console.error(error)
	return c.json(createErrorResponse(requestId, error), error.status)
}
