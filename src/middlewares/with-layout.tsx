import { ErrorBoundary } from "hono/jsx"
import { jsxRenderer } from "hono/jsx-renderer"

import { ErrorDetails } from "@/ui/error-details"
import { Footer } from "@/ui/footer"
import { Header, type HeaderProps } from "@/ui/header"
import { Root, type RootProps } from "@/ui/root"
import { ENVIRONMENT } from "@/utils/environment"

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

export const withLayout = () =>
	jsxRenderer(
		({
			subtitle,
			analytics = {
				provider: "umami",
				src: ENVIRONMENT.UMAMI_SRC,
				id: ENVIRONMENT.UMAMI_ID,
			},

			header = { enabled: true },
			children,
			...root
		}) => (
			<Root {...root}>
				<ErrorBoundary fallbackRender={(error) => <ErrorDetails err={error} />}>
					{header?.enabled ? (
						<Header back={header.back} links={header.links} />
					) : null}

					<main>
						<div class="title-details">
							<h1 class="title">{root.title}</h1>

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
