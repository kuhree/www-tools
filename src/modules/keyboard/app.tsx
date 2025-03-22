import { useEffect, useState } from "hono/jsx"

export function App() {
	const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({})

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			setPressedKeys((prev) => ({ ...prev, [e.code]: true }))
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			setPressedKeys((prev) => ({ ...prev, [e.code]: false }))
		}

		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("keyup", handleKeyUp)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("keyup", handleKeyUp)
		}
	}, [])

	return (
		<>
			<div class="subnav">
				<h2>Test Input Area</h2>
			</div>

			<textarea
				class="input-field"
				placeholder="Type here to test keyboard input..."
				style={{ width: "100%", height: "100px" }}
			/>

			<div class="subnav">
				<h2>Real-Time Key Presses</h2>
			</div>

			<div class="key-logs">
				{Object.entries(pressedKeys)
					.reverse()
					.map(([code, pressed]) => (
						<div key={code} class={`key-log ${pressed ? "pressed" : ""}`}>
							{code} {pressed ? "(Pressed)" : "(Released)"}
						</div>
					))}
			</div>
		</>
	)
}
