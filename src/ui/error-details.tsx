import type { PropsWithChildren } from "hono/jsx"

export type ErrorDetailsProps = PropsWithChildren<{
	error: Error
}>

export function ErrorDetails({ error }: ErrorDetailsProps) {
	const name = error.name ?? "Internal Server Error"
	const message = error.message ?? "Unknown Error"
	const code = "code" in error && error.code ? error.code : 500

	return (
		<details>
			<summary>
				<h2>
					Error: {name} ({code})
				</h2>
				<p>{message}</p>
			</summary>

			<pre>{error.toString()}</pre>
		</details>
	)
}
