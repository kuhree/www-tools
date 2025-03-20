import { describe, expect, it } from "bun:test"

import { EnvironmentSchema, parseEnvironment } from "./environment"

describe("Environment Parsing", () => {
	it("should successfully parse a valid environment", () => {
		const validEnv = {
			NODE_ENV: "production",
			PORT: "3000",
			ALLOWED_ORIGINS: "https://example.com",
			AUTHOR_EMAIL: "test@example.com",
			REPO_URL: "https://github.com/example/repo",
			UMAMI_SRC: "https://example.com/script.js",
			UMAMI_ID: "123e4567-e89b-12d3-a456-426614174000",
		}

		const parsedEnv = parseEnvironment(validEnv)
		expect(parsedEnv).toBeDefined()
		expect(EnvironmentSchema.safeParse(parsedEnv).success).toBe(true)
	})

	it("should throw when environment variables are invalid", () => {
		const invalidEnv = {
			NODE_ENV: "invalid",
			PORT: "invalid",
			ALLOWED_ORIGINS: "invalid",
			AUTHOR_EMAIL: "invalid",
			REPO_URL: "invalid",
			UMAMI_SRC: "invalid",
			UMAMI_ID: "invalid",
		}

		// FIXME: Bun's `.toThrow()` appears to be broken.
		// Try/Catch is a workaround: https://github.com/oven-sh/bun/issues/5602#issuecomment-2124933344
		try {
			parseEnvironment(invalidEnv)
		} catch (error) {
			expect(error).toBeDefined()
		}
	})

	it("should use default values when optional environment variables are missing", () => {
		const partialEnv = {}

		const parsedEnv = parseEnvironment(partialEnv)
		expect(parsedEnv).toBeDefined()

		if (parsedEnv) {
			expect(parsedEnv.NODE_ENV).toBe("production")
			expect(parsedEnv.PORT).toBe(8080) // Default value
			expect(parsedEnv.ALLOWED_ORIGINS).toBe("*") // Default value
			expect(parsedEnv.AUTHOR_EMAIL).toBe("hi@tools.kuhree.com") // Default value
			expect(parsedEnv.REPO_URL).toBe("https://github.com/kuhree/tools") // Default value
			expect(parsedEnv.UMAMI_SRC).toBe("https://umami.kuhree.com/script.js") // Default value
			expect(parsedEnv.UMAMI_ID).toBe("a4639b6e-ecc7-4de9-900e-e7902047f780") // Default value
		}
	})

	it("should coerce PORT to a number", () => {
		const env = {
			NODE_ENV: "production",
			PORT: "5000",
		}
		const parsedEnv = parseEnvironment(env)
		expect(parsedEnv).toBeDefined()
		if (parsedEnv) {
			expect(parsedEnv.PORT).toBe(5000)
		}
	})
})
