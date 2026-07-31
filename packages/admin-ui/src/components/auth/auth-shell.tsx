import { HardCard } from "@academy/user-ui/components/brand/primitives"
import type { ReactNode } from "react"

/**
 * Auth screen for the back office. Same brand language as the marketing
 * AuthShell (hard border + offset shadow on the page surface) but a single
 * centred column — staff sign-in needs no side panel or brand storytelling.
 */
export function AdminAuthShell({
  title,
  titleAccent,
  description,
  children,
  footer,
}: {
  title: string
  /** Rendered in Fraunces italic after the title, matching the brand headings. */
  titleAccent?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-surface-page px-6 py-10"
      style={{
        backgroundImage:
          "radial-gradient(color-mix(in oklab, var(--color-academy-ink) 6%, transparent) 1.2px, transparent 1.4px)",
        backgroundSize: "22px 22px",
      }}
    >
      <HardCard className="w-full max-w-104 p-card">
        <header className="flex flex-col gap-2.5">
          <span className="inline-flex size-10 items-center justify-center rounded-card border-2 border-border-strong bg-academy-yellow font-heading text-base font-medium shadow-hard-xs">
            UA
          </span>
          <h1 className="mt-1 text-section-title leading-display font-bold tracking-display">
            {title}
            {titleAccent && (
              <>
                {" "}
                <em className="font-heading font-medium italic">
                  {titleAccent}
                </em>
              </>
            )}
          </h1>
          {description && (
            <p className="text-sm text-content-muted">{description}</p>
          )}
        </header>

        <div className="mt-6">{children}</div>

        {footer && (
          <div className="mt-6 border-t-2 border-border-subtle pt-4 text-center text-sm text-content-muted">
            {footer}
          </div>
        )}
      </HardCard>
    </main>
  )
}

/** Inline banner used by all of the auth forms. */
export function AuthAlert({
  children,
  tone = "error",
}: {
  children: ReactNode
  tone?: "error" | "success"
}) {
  return (
    <p
      role="alert"
      className={`mb-5 rounded-card border-2 border-border-strong p-3 text-sm font-semibold ${
        tone === "error" ? "bg-academy-coral-soft" : "bg-academy-green-soft"
      }`}
    >
      {children}
    </p>
  )
}
