import { BrandButton } from "../brand/brand-button"

/**
 * Branded full-page error state shared by both apps' root ErrorBoundary. Copy is
 * code-level i18n on purpose — the boundary must render even when loaders (and
 * the locale they resolve) have failed.
 */
const copy = {
  es: {
    notFoundTitle: "Página no encontrada",
    notFoundText:
      "No pudimos encontrar la página que buscas. Puede que se haya movido o ya no exista.",
    genericTitle: "Algo salió mal",
    genericText:
      "Ocurrió un error inesperado. Ya estamos en ello — intenta de nuevo en un momento.",
    home: "Volver al inicio",
  },
  en: {
    notFoundTitle: "Page not found",
    notFoundText:
      "We couldn't find the page you're looking for. It may have moved or no longer exists.",
    genericTitle: "Something went wrong",
    genericText:
      "An unexpected error occurred. We're on it — try again in a moment.",
    home: "Back home",
  },
} as const

export interface ErrorPageProps {
  /** HTTP status when known (e.g. 404). Absent/non-404 renders the generic 500. */
  status?: number
  lang?: string
  /** Where the CTA sends the user (e.g. "/es" or "/es/dashboard"). */
  homeHref: string
  /** Optional CTA label override (defaults to the localized "back home"). */
  homeLabel?: string
  /** Dev-only stack trace; never pass in production. */
  stack?: string
}

export function ErrorPage({
  status,
  lang,
  homeHref,
  homeLabel,
  stack,
}: ErrorPageProps) {
  const c = copy[lang === "es" ? "es" : "en"]
  const is404 = status === 404
  const bigLabel = status ? String(status) : "500"
  const title = is404 ? c.notFoundTitle : c.genericTitle
  const text = is404 ? c.notFoundText : c.genericText

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-stack bg-academy-cream px-card py-16 text-center">
      <p className="font-heading text-[5.5rem] leading-none font-bold tracking-display text-academy-blue italic md:text-[8rem]">
        {bigLabel}
      </p>

      <div className="max-w-md">
        <h1 className="text-page-title leading-display font-bold tracking-display">
          {title}
        </h1>
        <p className="mt-stack text-base text-content-muted">{text}</p>
      </div>

      <BrandButton to={homeHref} variant="primary" size="lg" withArrow>
        {homeLabel ?? c.home}
      </BrandButton>

      {stack && (
        <pre className="mt-6 max-w-full overflow-x-auto rounded-card border-2 border-border-strong bg-surface-card p-4 text-left text-xs leading-relaxed">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
