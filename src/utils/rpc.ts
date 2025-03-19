import type { AppType } from "@/app"
import { hc } from "hono/client"

export const rpcClient = hc<AppType>("/")
