export async function basicAuthMiddleware(
  { request }: { request: Request },
  next: () => Promise<Response>
): Promise<Response> {
  const expected = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.STAGING_BASIC_AUTH

  if (!expected) return next()

  const [scheme, encoded] = (request.headers.get("Authorization") ?? "").split(
    " "
  )

  if (scheme === "Basic" && encoded && atob(encoded) === expected) {
    return next()
  }

  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Staging", charset="UTF-8"' },
  })
}
