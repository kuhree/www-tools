import { ErrorBoundary } from "hono/jsx"
import { jsxRenderer } from "hono/jsx-renderer"

import { ErrorDetails } from "@/ui/error-details"
import { Footer, Header, type HeaderProps, Root } from "@/ui/layout"

declare module "hono" {
	interface ContextRenderer {
		// biome-ignore lint/style/useShorthandFunctionType: this needs to be an interface so we can extend the default without conflict
		(
			content: string | Promise<string>,
			props: {
				title: string
				subtitle?: string
				header?: HeaderProps & { enabled: boolean }
			},
		): Response
	}
}

export const withLayout = jsxRenderer(
	({ title, subtitle, header = { enabled: true }, children }) => (
		<Root title={title}>
			<ErrorBoundary fallbackRender={(error) => <ErrorDetails error={error} />}>
				{header?.enabled ? (
					<Header back={header.back} links={header.links} />
				) : null}

				<main>
					<div class="title-details">
						<h1 class="title">{title}</h1>

						{subtitle ? <p class="subtitle">{subtitle}</p> : null}
					</div>

					{children}
				</main>

				<Footer />
			</ErrorBoundary>
		</Root>
	),
	{ stream: true },
)
