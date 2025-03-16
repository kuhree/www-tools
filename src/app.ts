import type { Environment } from "@/utils/environment";
import { Hono } from "hono";

export function createApp(env: Environment): Hono {
	const app = new Hono();

	return app;
}
