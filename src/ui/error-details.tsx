import { ErrorCodeToHttpStatusMap, toAppError } from "@/utils/error"
import type { PropsWithChildren } from "hono/jsx"

export type ErrorDetailsProps = PropsWithChildren<{
	err: unknown
}>

export function ErrorDetails({ err }: ErrorDetailsProps) {
	const error = toAppError(err)
	const name = error.name ?? "Internal Server Error"
	const message = error.message ?? "Unknown Error"
	const code =
		"code" in error && error.code
			? error.code
			: ErrorCodeToHttpStatusMap[error.code]
	const status = "status" in error && error.status ? error.status : 500

	return (
		<details>
			<summary>
				<span>{message}</span>
			</summary>

			<h2>
				{status}: {name} ({code})
			</h2>
			<pre>{error.toString()}</pre>
		</details>
	)
}
