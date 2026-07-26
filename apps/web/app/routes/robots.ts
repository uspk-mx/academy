import type { Route } from "./+types/robots"

/** /robots.txt — allow indexing of marketing pages, keep transactional and
 *  auth routes out, and point crawlers at the sitemap. Host is derived from the
 *  request so it's correct across staging/prod without config. */
export function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /*/checkout",
    "Disallow: /*/cart",
    "Disallow: /*/subscribe",
    "Disallow: /*/login",
    "Disallow: /*/logout",
    "Disallow: /*/signup",
    "Disallow: /*/confirm-account",
    "Disallow: /*/forgot-password",
    "Disallow: /*/change-password",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
