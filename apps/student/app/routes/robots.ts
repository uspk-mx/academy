import type { Route } from "./+types/robots"

/** /robots.txt — the student app is a logged-in LMS; nothing here should be
 *  indexed. Disallow everything (belt-and-suspenders with the noindex meta in
 *  the root layout and the auth middleware). */
export function loader(_: Route.LoaderArgs) {
  const body = "User-agent: *\nDisallow: /\n"
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
