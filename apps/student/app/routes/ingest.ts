import type { Route } from "./+types/ingest"

/**
 * Server-side reverse proxy for PostHog, mirroring the dev-only Vite proxy so
 * analytics keep working in production under `react-router-serve` (which has no
 * proxy of its own). The client posts to same-origin `/ingest/*` (dodging ad
 * blockers); we forward it to PostHog. Paths match the Vite config exactly:
 *   /ingest/static/* , /ingest/array/*  -> us-assets.i.posthog.com
 *   /ingest/*                           -> VITE_PUBLIC_POSTHOG_HOST (or us.i)
 */
const ASSET_HOST = "https://us-assets.i.posthog.com"
const API_HOST =
  process.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

function upstreamBase(wildcard: string): string {
  return wildcard.startsWith("static") || wildcard.startsWith("array")
    ? ASSET_HOST
    : API_HOST
}

async function proxy(
  request: Request,
  params: { "*"?: string }
): Promise<Response> {
  const wildcard = params["*"] ?? ""
  const search = new URL(request.url).search
  const target = `${upstreamBase(wildcard)}/${wildcard}${search}`

  const headers = new Headers(request.headers)
  headers.delete("host") // let fetch set it to the upstream host
  headers.delete("cookie") // never leak the app session cookie to PostHog

  const isBodyless = request.method === "GET" || request.method === "HEAD"
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: isBodyless ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  })

  // fetch already decodes the body, so the encoding/length headers would lie.
  const respHeaders = new Headers(upstream.headers)
  respHeaders.delete("content-encoding")
  respHeaders.delete("content-length")

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  })
}

export async function loader({ request, params }: Route.LoaderArgs) {
  return proxy(request, params)
}

export async function action({ request, params }: Route.ActionArgs) {
  return proxy(request, params)
}
