import { render } from "hono/jsx/dom"
import { App } from "./app"

const root = document.getElementById("root")
if (root) {
	render(<App />, root)
} else {
	console.error("Root not found.")
}
