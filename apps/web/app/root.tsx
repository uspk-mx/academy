import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useParams,
} from "react-router"
import { usePostHog } from "@posthog/react"

import { ErrorPage } from "@academy/user-ui/components/pages/error-page"
import "@academy/user-ui/globals.css"
import {
  DEFAULT_LANG,
  getLocale,
  isSupportedLang,
  logicalPathname,
  redirectToLocalizedPath,
} from "../lib/lang"
import { buildPageMeta } from "./lib/seo"
import type { Route } from "./+types/root"

// Site-wide SEO defaults. Leaf routes with their own `meta` override these.
export function meta({ params }: Route.MetaArgs) {
  return buildPageMeta({ lang: params.lang })
}
import { securityHeadersMiddleware } from "@academy/user-ui/middleware/security-headers"
import { posthogMiddleware } from "./lib/posthog-middleware"

export const middleware = [securityHeadersMiddleware, posthogMiddleware]

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url)

  // Judge the LOGICAL path — data requests ("/_.data") must not be prefixed.
  const firstSegment = logicalPathname(url).split("/").filter(Boolean)[0]

  if (!isSupportedLang(firstSegment)) {
    redirectToLocalizedPath(request)
  }

  const locales = getLocale(params.lang)

  return { locales }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang } = useParams()
  const htmlLang = isSupportedLang(lang) ? lang : DEFAULT_LANG
  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-academy-cream">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps) {
  const posthog = usePostHog()
  posthog?.captureException(error)

  const status = isRouteErrorResponse(error) ? error.status : undefined
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined

  return (
    <ErrorPage
      status={status}
      lang={params.lang}
      homeHref={`/${params.lang ?? DEFAULT_LANG}`}
      stack={stack}
    />
  )
}
