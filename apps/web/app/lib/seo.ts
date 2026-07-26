import { OG_LOCALES, type SupportedLang } from "../../lib/lang"

/**
 * Builds a consistent set of SEO + Open Graph + Twitter meta descriptors for a
 * marketing page. Returns an array shaped for a React Router `meta` export.
 *
 * `og:image` is only emitted when an image is available — either passed in, or
 * from `VITE_OG_IMAGE_URL` — so we never advertise a non-existent asset. Set
 * `VITE_OG_IMAGE_URL` (e.g. an absolute https URL to a 1200x630 image) to light
 * up rich social cards site-wide.
 */
const SITE_NAME = "Uspk Academy"

const DEFAULT_DESCRIPTION: Record<SupportedLang, string> = {
  es: "Cursos en línea para impulsar tu carrera profesional con Uspk Academy.",
  en: "Online courses to advance your career with Uspk Academy.",
}

export interface PageMetaInput {
  title?: string
  description?: string
  lang?: string
  /** Absolute canonical URL for this page, if known. */
  url?: string
  /** Absolute image URL; falls back to VITE_OG_IMAGE_URL. */
  image?: string
}

export function buildPageMeta({
  title,
  description,
  lang,
  url,
  image,
}: PageMetaInput) {
  const safeLang: SupportedLang = lang === "es" ? "es" : "en"
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const desc = description ?? DEFAULT_DESCRIPTION[safeLang]
  const img =
    image ??
    (import.meta.env.VITE_OG_IMAGE_URL as string | undefined) ??
    undefined

  const tags: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: desc },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: desc },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: OG_LOCALES[safeLang] },
    { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: desc },
  ]

  if (url) {
    tags.push({ property: "og:url", content: url })
    tags.push({ tagName: "link", rel: "canonical", href: url })
  }
  if (img) {
    tags.push({ property: "og:image", content: img })
    tags.push({ name: "twitter:image", content: img })
  }

  return tags
}
