/**
 * Session-gated flows (e.g. free enrollment) send anonymous users to auth
 * with a `redirect` param and come back after login/signup.
 */
export function loginHref(lang: string, redirectTo: string): string {
  return `/${lang}/login?redirect=${encodeURIComponent(redirectTo)}`;
}

export function signupHref(lang: string, redirectTo: string): string {
  return `/${lang}/signup?redirect=${encodeURIComponent(redirectTo)}`;
}

/** Only local paths — never absolute/protocol-relative URLs (open redirect). */
export function safeRedirect(value: string | null | undefined, fallback = "/"): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}