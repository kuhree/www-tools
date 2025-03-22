import { ENVIRONMENT } from "@/utils/environment"

const contactLinks = [
	[
		"Submit a request",
		encodeURI(`${ENVIRONMENT.REPO_URL}/issues/new?title=[Request]`),
	],
	[
		"Report an issue",
		encodeURI(`${ENVIRONMENT.REPO_URL}/issues/new?title=[Issue]`),
	],
	["Get in Touch", `mailto:${ENVIRONMENT.AUTHOR_EMAIL}`],
]

export function Homepage() {
	return (
		<>
			<div class="tool-list">
				<h2>Tools List</h2>
				<div class="list">
					<a href="/tools/usernames">Username Search</a>
					<a href="/tools/images">Image Optimizer</a>
					<a href="/tools/webcams">Webcam Tester</a>
					<a href="/tools/resolution">Screen Resolution</a>
					<a href="/tools/keyboard">Keyboard Tester</a>
				</div>
			</div>

			<div class="tool-list">
				<h2>Additional tools in development</h2>
				<div>Check back soon or contribute to help build new features:</div>
				<div class="list">
					{contactLinks.map(([text, href]) => (
						<a key={href} href={href} class="button">
							{text}
						</a>
					))}
				</div>
			</div>
		</>
	)
}
