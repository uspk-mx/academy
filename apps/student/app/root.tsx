import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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
} from "@academy/user-ui/lib/lang"
import type { Route } from "./+types/root"
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

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang } = useParams()
  const htmlLang = isSupportedLang(lang) ? lang : DEFAULT_LANG
  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Logged-in LMS — never index. */}
        <meta name="robots" content="noindex, nofollow" />
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

  // Student is a logged-in LMS — send users back to their dashboard.
  return (
    <ErrorPage
      status={status}
      lang={params.lang}
      homeHref={`/${params.lang ?? DEFAULT_LANG}/dashboard`}
      stack={stack}
    />
  )
}
