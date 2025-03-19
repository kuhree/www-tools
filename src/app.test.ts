import { describe, expect, it } from "bun:test"
import type { Environment } from "@/utils/environment"
import { makeApp } from "./app"

// Mock the environment variables for testing
const mockEnvironment: Environment = {
	NODE_ENV: "test",
	PORT: 3000,
	ALLOWED_ORIGINS: "*",
	AUTHOR_EMAIL: "test@example.com",
	REPO_URL: "https://github.com/example/repo",
	UMAMI_SRC: "https://example.com/script.js",
	UMAMI_ID: "123e4567-e89b-12d3-a456-426614174000",
}

describe("Route Handling (Happy Path)", () => {
	const app = makeApp(mockEnvironment)

	it("should return 200 OK for /health", async () => {
		const res = await app.request("/health")
		expect(res.status).toBe(200)
		expect(await res.text()).toBe("ok")
	})

	it("should return 200 OK for /ping", async () => {
		const res = await app.request("/ping")
		expect(res.status).toBe(200)
		expect(await res.text()).toBe("pong")
	})

	it("should return 200 OK for /", async () => {
		const res = await app.request("/")
		expect(res.status).toBe(200)
		const body = await res.text()
		expect(body).toContain("Web Toolbox")
	})

	it("should return 302 Found for /t/:tool", async () => {
		const res = await app.request("/t/images")
		expect(res.status).toBe(302)
	})

	it("should return 200 OK for /tools/:tool", async () => {
		const res = await app.request("/tools/images")
		expect(res.status).toBe(200)
		const body = await res.text()
		expect(body).toContain('<div id="root"></div>')
	})
})

describe("Static Asset Serving", () => {
	const app = makeApp(mockEnvironment)

	it("should return 200 OK for a known static asset (favicon.ico)", async () => {
		const res = await app.request("/favicon.ico")
		expect(res.status).toBe(200)
		expect(res.headers.get("Content-Type")).toBe("image/x-icon")
		expect(res.headers.get("Cache-Control")).toBe(
			"public, immutable, max-age=31536000",
		)
	})

	it("should return 404 Not Found for a non-existent static asset", async () => {
		const res = await app.request("/non-existent.css")
		expect(res.status).toBe(404)
	})
})

describe("Dynamic Build Route", () => {
	const app = makeApp(mockEnvironment)

	it("should return 200 OK for /tools/:tool/entry.js with a valid tool", async () => {
		const tool = "images" // Or any other valid tool name
		const res = await app.request(`/tools/${tool}/entry.js`)
		expect(res.status).toBe(200)
		expect(res.headers.get("Content-Type")).toBe("application/javascript")
		expect(res.headers.get("Cache-Control")).toBe(
			"public, immutable, max-age=31536000",
		)

		// Check if the response body contains valid javascript
		const body = await res.text()
		expect(body).toContain('document.getElementById("root")') // A basic check
	})

	it("should return 500 for /tools/:tool/entry.js with an invalid tool", async () => {
		const tool = "invalid-tool"
		const res = await app.request(`/tools/${tool}/entry.js`)
		expect(res.status).toBe(500)
	})
})
