/**
 * Cross-app URLs.
 *
 * The student app is deployed on `app.uspkacademy.com` while auth and the
 * marketing site live on the apex `uspkacademy.com`, so "go to login" is a
 * cross-origin redirect there — but same-origin in the web app itself. Both are
 * driven by one env var:
 *
 *   AUTH_BASE_URL   server-side (middleware, loaders)
 *   VITE_AUTH_BASE_URL  exposed to the browser when a component needs it
 *
 * Unset (the web app, and local dev) → same-origin, i.e. plain paths.
 */

/** Reads a server env var without requiring node types in this package. */
function serverEnv(name: string): string | undefined {
  const proc = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process
  return proc?.env?.[name]
}

/** Origin that serves /login — "" means same-origin. */
export function authBaseUrl(): string {
  const fromClient = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env?.VITE_AUTH_BASE_URL
  return (serverEnv("AUTH_BASE_URL") || fromClient || "").replace(/\/+$/, "")
}

/**
 * A locale-scoped URL on the apex/marketing app (cart, checkout, catalog) — the
 * same origin that serves /login. Cross-origin from the student app in prod,
 * same-origin (plain path) in the web app and local dev.
 */
export function marketingUrlFor(lang: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  return `${authBaseUrl()}/${lang}${clean}`
}

/**
 * Origin of the student app (where the dashboard lives), for links pointing
 * there FROM the marketing/web app — the inverse of {@link marketingUrlFor}.
 * Uses the build-inlined `VITE_STUDENT_APP_URL` only (no server override), so
 * SSR and the hydrated client render the identical href with no hydration
 * mismatch. "" → same-origin, which is correct inside the student app itself
 * and in single-app local dev.
 */
export function studentAppUrl(): string {
  return (
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_STUDENT_APP_URL || ""
  ).replace(/\/+$/, "")
}

/** A locale-scoped URL on the student app (dashboard, courses, profile). */
export function studentUrlFor(lang: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  return `${studentAppUrl()}/${lang}${clean}`
}

/**
 * Absolute URL of the running app — needed as the `redirect` value when login
 * lives on another origin, since a bare path would resolve against *that* host.
 */
export function appBaseUrl(request: Request): string {
  const configured = serverEnv("APP_BASE_URL")
  if (configured) return configured.replace(/\/+$/, "")
  return new URL(request.url).origin
}

/**
 * Origins the auth app is allowed to send a user back to after login.
 * Comma-separated `ALLOWED_RETURN_ORIGINS`, defaulting to `APP_BASE_URL`.
 */
export function allowedReturnOrigins(): string[] {
  const raw =
    serverEnv("ALLOWED_RETURN_ORIGINS") ?? serverEnv("APP_BASE_URL") ?? ""
  return raw
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean)
}

/**
 * Post-login destination. Local paths pass through; absolute URLs are only
 * honoured when their origin is explicitly allowlisted — anything else falls
 * back, so this can never become an open redirect.
 */
export function safeReturnTo(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw) return fallback
  // Same-origin path (reject protocol-relative "//evil.com").
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw
  try {
    const url = new URL(raw)
    if (allowedReturnOrigins().includes(url.origin)) return url.toString()
  } catch {
    // Not a parsable URL — fall through.
  }
  return fallback
}

export function loginUrlFor({
  request,
  lang,
  returnTo,
}: {
  request: Request
  lang: string
  /** Logical path the visitor wanted, e.g. "/en/dashboard/courses". */
  returnTo: string
}): string {
  const base = authBaseUrl()
  const redirectTo = base ? `${appBaseUrl(request)}${returnTo}` : returnTo
  return `${base}/${lang}/login?redirect=${encodeURIComponent(redirectTo)}`
}

/**
 * Origin of the Go API, for its non-GraphQL endpoints (e.g. OAuth), derived
 * from VITE_API_URL by dropping the `/query` path. Client-safe (the API URL is
 * public). Falls back to local dev.
 */
export function apiBaseUrl(): string {
  const fromClient = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env?.VITE_API_URL
  const raw =
    serverEnv("API_URL") || fromClient || "http://localhost:4000/query"
  try {
    return new URL(raw).origin
  } catch {
    return raw.replace(/\/query\/?$/, "")
  }
}

/**
 * URL that kicks off Google OAuth on the API. `returnTo` (where to land after
 * login) and `lang` ride along and are validated server-side, so they can never
 * become an open redirect.
 */
export function googleOAuthUrl(lang: string, returnTo?: string | null): string {
  const params = new URLSearchParams({ lang })
  if (returnTo) params.set("returnTo", returnTo)
  return `${apiBaseUrl()}/auth/google/login?${params.toString()}`
}
