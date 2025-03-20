import { z } from "zod"
import { AppError, ErrorCodes } from "./error"

export type Environment = z.infer<typeof EnvironmentSchema>
export const EnvironmentSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
	PORT: z.coerce.number().min(0).default(8080),

	ALLOWED_ORIGINS: z.string().default("*"),

	AUTHOR_EMAIL: z.string().email().default("hi@tools.kuhree.com"),
	REPO_URL: z.string().url().default("https://github.com/kuhree/tools"),

	UMAMI_SRC: z.string().url().default("https://umami.kuhree.com/script.js"),
	UMAMI_ID: z.string().default("a4639b6e-ecc7-4de9-900e-e7902047f780"),
})

export function parseEnvironment(env: unknown): Environment {
	const result = EnvironmentSchema.safeParse(env)
	if (result.success) {
		console.debug("[Environment] Valid!")
		return result.data
	}

	for (const error of result.error.errors) {
		console.error(
			`[Environment] :: Invalid environment variable ${error.path.join(".")}.`,
			error.message,
		)
	}

	throw new AppError(
		ErrorCodes.VALIDATION_ERROR,
		"Environment is invalid",
		result.error.format(),
	)
}

export const ENVIRONMENT = parseEnvironment(process.env)
