import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "zod"

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
export const ErrorCodes = {
	NOTFOUND_ERROR: "NOTFOUND_ERROR",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

export const ErrorCodeToHttpStatusMap: Record<ErrorCode, ContentfulStatusCode> =
	{
		[ErrorCodes.NOTFOUND_ERROR]: 404,
		[ErrorCodes.VALIDATION_ERROR]: 400,
		[ErrorCodes.UNAUTHORIZED]: 401,
		[ErrorCodes.FORBIDDEN]: 403,
		[ErrorCodes.INTERNAL_ERROR]: 500,
		[ErrorCodes.UNKNOWN_ERROR]: 500,
	}

export class AppError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public details?: unknown,
		public status?: ContentfulStatusCode,
	) {
		super(message)
		this.name = "AppError"
		if (!status) {
			this.status = ErrorCodeToHttpStatusMap[this.code] ?? 500
		}
	}
}

export function toAppError(err: unknown): AppError {
	let error: AppError

	if (err instanceof AppError) {
		error = err
	} else if (err instanceof HTTPException) {
		error = new AppError(
			ErrorCodes.INTERNAL_ERROR,
			err.message,
			undefined,
			err.status,
		)

		error.stack = err.stack
		error.cause = err.cause
	} else if (err instanceof z.ZodError) {
		error = new AppError(
			ErrorCodes.VALIDATION_ERROR,
			"Validation failed",
			err.format(),
		)

		error.stack = err.stack
		error.cause = err.cause
	} else if (err instanceof Error) {
		error = new AppError(ErrorCodes.INTERNAL_ERROR, err.message)

		error.stack = err.stack
		error.cause = err.cause
	} else {
		error = new AppError(ErrorCodes.UNKNOWN_ERROR, "An unknown error occurred")
	}

	return error
}
