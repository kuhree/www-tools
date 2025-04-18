import type { PropsWithChildren } from "hono/jsx"

export type RootProps = PropsWithChildren<{
	title: string
	analytics?: { provider: "umami"; src: string; id: string }
	stylesheets?: string[]
	scripts?: string[]
}>

export function Root({
	title,
	stylesheets,
	scripts,
	analytics,
	children,
}: RootProps) {
	return (
		<>
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta content="width=device-width, initial-scale=1" name="viewport" />
					<link rel="stylesheet" href="/static/monospace-web/reset.css" />
					<link rel="stylesheet" href="/static/monospace-web/index.css" />
					<link rel="stylesheet" href="/static/styles/index.css" />
					{stylesheets
						? stylesheets?.map((href) => (
								<link key={href} rel="stylesheet" href={href} />
							))
						: stylesheets}
					<title>{title} | Kuhree's Web Tools</title>
					{analytics?.provider === "umami" ? (
						<script defer src={analytics.src} data-website-id={analytics.id} />
					) : null}
				</head>

				<body>
					{children}
					<script
						async
						type="text/javascript"
						src="/static/monospace-web/index.js"
					/>
					{scripts
						? scripts?.map((src) => (
								<script key={src} type="text/javascript" src={src} />
							))
						: null}
				</body>
			</html>
		</>
	)
}
