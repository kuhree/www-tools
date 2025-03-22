import type { PlatformResult } from "@/modules/usernames/api"
import { useEffect, useRef, useState } from "hono/jsx"

export function App() {
	const [username, setUsername] = useState<string>("")
	const [results, setResults] = useState<PlatformResult[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	const handleUsername = async (e: Event) => {
		const newUsername = (e.target as HTMLInputElement).value
		window.history.replaceState({}, "", `?username=${newUsername}`)
		setUsername(newUsername)
		setResults([])
		setError(null)
	}

	const handleSubmit = async (e: Event) => {
		e.preventDefault()
		if (!username.trim()) return

		setIsLoading(true)
		setError(null)
		setResults([])

		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		const controller = new AbortController()
		abortControllerRef.current = controller

		try {
			const response = await fetch(
				`/api/v1/usernames/${encodeURIComponent(username)}`,
				{
					signal: controller.signal,
				},
			)

			if (!response.ok) throw new Error("Internal Server Error")
			if (!response.body) throw new Error("No response body")

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value)
				const lines = buffer.split("\n")

				buffer = lines.pop() || ""

				for (const line of lines) {
					if (!line.trim()) continue

					try {
						const data = JSON.parse(line)
						if (data.error) {
							setError(data.error)
							controller.abort()
							return
						}

						setResults((prev) => [...prev, data])
					} catch (err) {
						console.error("Error parsing JSON:", err)
					}
				}
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				console.log("Request aborted")
			} else {
				setError(err instanceof Error ? err.message : "Unknown error occurred")
			}
		} finally {
			setIsLoading(false)
			abortControllerRef.current = null
		}
	}

	useEffect(() => {
		const urlSearchParams = new URLSearchParams(window.location.search)
		const urlUsername = urlSearchParams.get("username")
		if (urlUsername) setUsername(urlUsername)

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])

	return (
		<>
			<form onSubmit={handleSubmit} class="form-container">
				<input
					required
					id="username"
					class="width-auto form-input"
					type="text"
					tabindex={1}
					disabled={isLoading}
					value={username}
					onChange={handleUsername}
					placeholder="Enter username to check availability on 400+ platforms"
				/>

				<div class="form-actions">
					<button
						type="submit"
						class="btn-primary"
						tabindex={2}
						disabled={isLoading || !username.trim()}
					>
						{isLoading ? "Checking..." : "Check Availability"}
						{isLoading && <span class="spinner" />}
					</button>
				</div>

				<div class="form-status">
					{error && (
						<div class="error-box">
							<span class="error-icon">!</span>
							<span class="error-text">{error}</span>
						</div>
					)}
					{isLoading && (
						<div class="loading-status">
							[*] Checking username: {username}
							<span class="blink">...</span>
						</div>
					)}
					{!isLoading && results.length === 0 && !error && (
						<pre>[?] Enter a username above to begin search</pre>
					)}
				</div>
			</form>

			{results.length > 0 && (
				<div class="results-container">
					<h2 class="section-title">Platform Availability</h2>

					<div class="results-grid">
						<div class="result-column unavailable">
							<h3 class="column-header">Unavailable</h3>
							<ul class="result-list">
								{results
									.filter((result) => !result.available)
									.map((result) => (
										<li class="result-item" key={result.id}>
											<span class="platform-name">[+] {result.id}</span>
											{result.message && <span>{result.message}</span>}
											{result.url && (
												<a
													href={result.url}
													class="platform-link"
													target="_blank"
													rel="noopener noreferrer"
												>
													{result.url}
												</a>
											)}
										</li>
									))}
								{results.filter((r) => !r.available).length === 0 && (
									<li class="result-item">No unavailable platforms found</li>
								)}
							</ul>
						</div>

						<div class="result-column available">
							<h3 class="column-header">Available</h3>
							<ul class="result-list">
								{results
									.filter((result) => result.available)
									.map((result) => (
										<li class="result-item" key={result.id}>
											<span class="platform-name">[-] {result.id}</span>
											{result.message && <span>{result.message}</span>}
										</li>
									))}
								{results.filter((r) => r.available).length === 0 && (
									<li class="result-item">No available platforms found</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
