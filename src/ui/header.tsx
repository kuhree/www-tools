export type HeaderProps = {
	back?: null | { href: string; name: string }
	links?: null | { [key: string]: string }
}

export function Header({
	back = { href: "javascript:history.back()", name: "Back" },
	links = {
		home: "/",
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
