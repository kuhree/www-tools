import { ErrorBoundary } from "hono/jsx"
import { jsxRenderer } from "hono/jsx-renderer"

import { ErrorDetails } from "@/ui/error-details"
import {
	Footer,
	Header,
	type HeaderProps,
	Root,
	type RootProps,
} from "@/ui/layout"
import type { Environment } from "@/utils/environment"

declare module "hono" {
	interface ContextRenderer {
		// biome-ignore lint/style/useShorthandFunctionType: this needs to be an interface so we can extend the default without conflict
		(
			content: string | Promise<string>,
			props: RootProps & {
				subtitle?: string
				header?: HeaderProps & { enabled: boolean }
			},
		): Response
	}
}

export const withLayout = (environment: Environment) =>
	jsxRenderer(
		({
			title,
			subtitle,
			header = { enabled: true },
			umami = {
				src: environment.UMAMI_SRC,
				id: environment.UMAMI_ID,
			},
			children,
		}) => (
			<Root title={title} umami={umami}>
				<ErrorBoundary fallbackRender={(error) => <ErrorDetails err={error} />}>
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
