import { z } from "zod"

export type Environment = z.infer<typeof EnvironmentSchema>
export const EnvironmentSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
	PORT: z.coerce.number().min(0).default(8080),

	ALLOWED_ORIGINS: z.string().default("*"),

	AUTHOR_EMAIL: z.string().email().default("hi@tools.kuhree.com"),
	REPO_URL: z.string().url().default("https://github.com/kuhree/tools"),

	UMAMI_SRC: z.string().url().default("https://www-umami.fly.dev/script.js"),
	UMAMI_ID: z.string().default("fd2f9af9-c37c-413f-943b-77ce12f4500e"),
})

export function parseEnvironment(env: unknown): null | Environment {
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

	return null
}
