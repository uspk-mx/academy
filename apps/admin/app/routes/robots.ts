import type { Route } from "./+types/robots"

/** The admin panel must never be indexed. */
export function loader(_: Route.LoaderArgs) {
  return new Response("User-agent: *\nDisallow: /\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
