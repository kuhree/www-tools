import type { PropsWithChildren } from "hono/jsx"

export type RootProps = PropsWithChildren<{
	title: string
}>

export function Root({ title, children }: RootProps) {
	return (
		<>
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta content="width=device-width, initial-scale=1" name="viewport" />
					<link rel="stylesheet" href="/static/monospace-web/reset.css" />
					<link rel="stylesheet" href="/static/monospace-web/index.css" />
					<link rel="stylesheet" href="/static/styles/index.css" />
					<title>{title} | Kuhree's Web Tools</title>
				</head>

				<body>
					{children}
					<script
						async
						type="text/javascript"
						src="/static/monospace-web/index.js"
					/>
				</body>
			</html>
		</>
	)
}

export type HeaderProps = {
	back?: null | { href: string; name: string }
	links?: null | { [key: string]: string }
}
export function Header({
	back = { href: "javascript:history.back()", name: "Back" },
	links = {
		home: "/",
		apps: "/apps",
		links: "/links",
	},
}: HeaderProps) {
	return (
		<header class="header">
			<nav class="header-nav">
				{back ? (
					<div class="nav-list">
						<a href={back.href}>&lt;- {back.name}</a>
					</div>
				) : null}

				{links ? (
					<div class="nav-list">
						{Object.entries(links).map(([key, href]) => (
							<a key={href} href={href}>
								{key}
							</a>
						))}
					</div>
				) : null}
			</nav>
		</header>
	)
}

export type FooterProps = PropsWithChildren
export function Footer({ children }: FooterProps) {
	return (
		<footer>
			{children}

			<hr />

			<h2>Powered By</h2>
			<ul>
				<li>
					Styling -&gt;{" "}
					<a href="https://owickstrom.github.io/the-monospace-web/">
						<cite>The Monospace Web</cite>
					</a>
				</li>

				<li>
					JS Runtime -&gt;{" "}
					<a href="https://bun.sh">
						<cite>Bun</cite>
					</a>
				</li>

				<li>
					Web Framework -&gt;{" "}
					<a href="https://hono.dev">
						<cite>Hono</cite>
					</a>
				</li>
			</ul>

			<hr />

			<h2>
				Created By{" "}
				<a href="https://kuhree.com">
					<cite>Kuhree</cite>
				</a>
			</h2>
		</footer>
	)
}
