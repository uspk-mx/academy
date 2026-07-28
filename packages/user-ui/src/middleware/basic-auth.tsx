const GATE_COOKIE = "stg_gate"

async function gateToken(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret)
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function basicAuthMiddleware(
  { request }: { request: Request },
  next: () => Promise<Response>
): Promise<Response> {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env
  const expected = env?.STAGING_BASIC_AUTH

  if (!expected) return next()

  const token = await gateToken(expected)

  const cookies = request.headers.get("Cookie") ?? ""
  if (cookies.split(";").some((c) => c.trim() === `${GATE_COOKIE}=${token}`)) {
    return next()
  }

  const [scheme, encoded] = (request.headers.get("Authorization") ?? "").split(
    " "
  )

  if (scheme === "Basic" && encoded && atob(encoded) === expected) {
    const response = await next()
    const domain = env?.COOKIE_DOMAIN
    response.headers.append(
      "Set-Cookie",
      `${GATE_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800${
        domain ? `; Domain=${domain}` : ""
      }`
    )
    return response
  }

  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Staging", charset="UTF-8"' },
  })
}
