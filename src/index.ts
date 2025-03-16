import { parseEnvironment } from "@/utils/environment";
import { createApp } from "./app";

const env = parseEnvironment(process.env);
if (!env) {
	process.exit(1);
}

const app = createApp(env);

export default {
	PORT: env.PORT,
	fetch: app.fetch,
};
