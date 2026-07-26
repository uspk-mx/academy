import {
  isSupportedLang,
  logicalPathname,
  redirectToLocalizedPath,
} from "../../lib/lang"
import type { Route } from "./+types/lang-splat"

/**
 * Catch-all for paths that match no route. A lang-less path (e.g. an emailed
 * "/change-password?token=" or "/courses/<slug>") is redirected to the
 * locale-prefixed equivalent using the visitor's `lang` cookie (else the
 * default), preserving the query string. Root's loader already handles paths
 * that *do* match a route under a bogus `:lang`; this covers the rest, which
 * otherwise 404 before the root loader runs.
 *
 * A path whose first segment IS a valid lang is a genuine not-found — we let it
 * 404 rather than redirect (which would loop).
 */
export async function loader({ request }: Route.LoaderArgs) {
  const firstSegment = logicalPathname(new URL(request.url))
    .split("/")
    .filter(Boolean)[0]

  if (!isSupportedLang(firstSegment)) {
    redirectToLocalizedPath(request) // throws a redirect
  }

  throw new Response("Not Found", { status: 404 })
}

export default function LangSplat() {
  return null
}
