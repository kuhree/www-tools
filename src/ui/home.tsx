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
			<h2>All Tools</h2>
			<div class="subnav">
				<a href="/tools/usernames">Username Search</a>
				<a href="/tools/images">Image Optimizer</a>
				<a href="/tools/webcams">Webcam Tester</a>
			</div>

			<h2>More coming soon...</h2>
			<ul>
				{contactLinks.map(([text, href]) => (
					<li key={href}>
						<a href={href}>{text}</a>
					</li>
				))}
			</ul>
		</>
	)
}
