import { redirect } from 'react-router'

export function replaceLocaleInPath(pathname: string, locale: string) {
  return pathname.replace(/^\/(es|en)/, `/${locale}`)
}

export type Locales = 'en' | 'es_MX'

export const SUPPORTED_LANGS = ['es', 'en']
export const DEFAULT_LANG = 'en'

export const HYGRAPH_LOCALES: Record<SupportedLang, Locales> = {
  es: 'es_MX',
  en: 'en',
}

export const OG_LOCALES: Record<SupportedLang, string> = {
  es: 'es_MX',
  en: 'en_US',
}

export function getLocale(lang?: string) {
  if (!isSupportedLang(lang)) return HYGRAPH_LOCALES[DEFAULT_LANG]

  return HYGRAPH_LOCALES[lang]
}

export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

export function isSupportedLang(
  value: string | undefined
): value is SupportedLang {
  return SUPPORTED_LANGS.includes(value as SupportedLang)
}

export function getPreferredLang(request: Request): SupportedLang {
  const cookie = request.headers.get('Cookie')

  const langMatch = cookie?.match(/(?:^|;\s*)lang=(es|en)(?:;|$)/)
  const cookieLang = langMatch?.[1]

  if (isSupportedLang(cookieLang)) {
    return cookieLang
  }

  const acceptLanguage = request.headers.get('Accept-Language')
  const browserLang = acceptLanguage?.split(',')[0]?.split('-')[0]

  if (isSupportedLang(browserLang)) {
    return browserLang
  }

  return DEFAULT_LANG
}

/**
 * React Router v7 single-fetch hits "<path>.data" URLs for client-side
 * navigations (root: "/_.data" / "/_root.data"). Lang redirects must target
 * the LOGICAL path, never the internal data URL — otherwise a redirect chain
 * lands the browser on e.g. "/en/_.data".
 */
export function logicalPathname(url: URL): string {
  let pathname = url.pathname
  if (pathname.endsWith('.data')) {
    pathname = pathname.slice(0, -'.data'.length)
    if (pathname === '/_root' || pathname === '/_') pathname = '/'
  }
  return pathname
}

export function redirectToLocalizedPath(request: Request) {
  const url = new URL(request.url)
  const pathname = logicalPathname(url)

  const preferredLang = getPreferredLang(request)

  const localizedPath =
    pathname === '/' ? `/${preferredLang}` : `/${preferredLang}${pathname}`

  // Drop RR-internal params; keep the rest (e.g. ?token=, ?session_id=).
  const search = new URLSearchParams(url.search)
  search.delete('_routes')
  const qs = search.toString()

  throw redirect(qs ? `${localizedPath}?${qs}` : localizedPath)
}
