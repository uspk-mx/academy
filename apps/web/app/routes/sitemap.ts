import type { Route } from "./+types/sitemap"
import { SUPPORTED_LANGS } from "../../lib/lang"

/** Indexable marketing pages (per locale). Transactional/auth routes are left
 *  out on purpose — they're disallowed in robots.txt too. Deep dynamic pages
 *  (courses/:id, blog/:slug, memberships/:planId) can be appended here later by
 *  fetching their slugs; kept static for now so the route never depends on a
 *  live CMS/API call. */
const STATIC_PATHS = ["", "courses", "about", "blog", "memberships"]

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin

  const entries: string[] = []
  for (const lang of SUPPORTED_LANGS) {
    for (const path of STATIC_PATHS) {
      const loc = path ? `${origin}/${lang}/${path}` : `${origin}/${lang}`
      entries.push(`  <url><loc>${xmlEscape(loc)}</loc></url>`)
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
