/**
 * Adds a baseline set of security headers to every response. Deliberately
 * conservative so it won't break embedded third parties (Stripe Elements,
 * PostHog): no strict CSP here — just clickjacking + MIME-sniffing protection,
 * a privacy-preserving referrer policy, and HSTS in production (HTTPS only).
 *
 * Runs as the outermost middleware so it stamps the final response, whatever
 * the route returned.
 */
export async function securityHeadersMiddleware(
  _: any,
  next: () => Promise<Response>
): Promise<Response> {
  const response = await next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // HSTS only makes sense over HTTPS; scope it to production so localhost dev
  // (plain HTTP) is never pinned to https by a stray header. Read process.env
  // via globalThis so this package needn't depend on @types/node.
  const nodeEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.NODE_ENV
  if (nodeEnv === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    )
  }

  return response
}
