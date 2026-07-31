import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"

import { usePostHog } from "@posthog/react"
import { Toaster } from "sonner"

import "@academy/admin-ui/globals.css"
import { ErrorPage } from "@academy/user-ui/components/pages/error-page"
import { basicAuthMiddleware } from "@academy/user-ui/middleware/basic-auth"
import { securityHeadersMiddleware } from "@academy/user-ui/middleware/security-headers"
import { posthogMiddleware } from "./lib/posthog-middleware"
import type { Route } from "./+types/root"

export const middleware = [
  securityHeadersMiddleware,
  basicAuthMiddleware,
  posthogMiddleware,
]

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "96x96",
    href: "/favicon-96x96.png",
  },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#FFD123" />
        <meta name="apple-mobile-web-app-title" content="USPK Academy Admin" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const posthog = usePostHog()
  posthog?.captureException(error)

  const status = isRouteErrorResponse(error) ? error.status : undefined
  const stack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined

  return <ErrorPage status={status} lang="es" homeHref="/courses" stack={stack} />
}
