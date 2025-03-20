import type { PropsWithChildren } from "hono/jsx"

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
