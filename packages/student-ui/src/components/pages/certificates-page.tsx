import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAward,
  IconCalendarStats,
  IconCertificate,
} from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { LazyCertificateDownload } from "../certificate/certificate-download-lazy"
import type {
  CertificatesPageLabels,
  CertificateView,
} from "../../types/certificate"

export interface StudentCertificatesPageProps {
  items: CertificateView[]
  labels: CertificatesPageLabels
  /** Lang-scoped "Mis Cursos" link for the empty state. */
  coursesHref: string
  /** Course id from `?course=`; its card scrolls into view and flashes. */
  highlightCourseId?: string | null
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

function isThisMonth(value: string): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

/**
 * "Mis Certificados" — one card per credential from `myCertificates`. The card
 * is the only chrome; the PDF itself is generated on demand, client-side, by
 * `CertificateActions`.
 */
export function StudentCertificatesPage({
  items,
  labels,
  coursesHref,
  highlightCourseId,
}: StudentCertificatesPageProps) {
  const total = items.length
  const thisMonth = items.filter((cert) => isThisMonth(cert.issuedAt)).length
  const hasCertificates = total > 0

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-yellow p-2">
            <IconCertificate aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              {labels.pageTitle}
            </h1>
            <p className="text-sm text-content-muted">{labels.pageSubtitle}</p>
          </div>
        </div>
      </header>

      {hasCertificates && (
        <div className="grid grid-cols-2 gap-3 md:max-w-md">
          <StatTile
            icon={IconAward}
            tone="bg-academy-green"
            label={labels.statsTotal}
            value={total}
          />
          <StatTile
            icon={IconCalendarStats}
            tone="bg-academy-blue"
            label={labels.statsThisMonth}
            value={thisMonth}
          />
        </div>
      )}

      {!hasCertificates && (
        <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
          <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
            <span className="flex size-16 items-center justify-center rounded-card border-2 border-border-strong bg-academy-yellow">
              <IconCertificate aria-hidden className="size-8" />
            </span>
            <h2 className="text-card-title font-bold tracking-tight-brand">
              {labels.emptyTitle}
            </h2>
            <p className="text-content-muted">{labels.emptyDescription}</p>
            <Link
              to={coursesHref}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            >
              {labels.emptyCta}
            </Link>
          </div>
        </div>
      )}

      {hasCertificates && (
        <div className="grid gap-stack md:grid-cols-2">
          {items.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              labels={labels}
              highlight={cert.courseId === highlightCourseId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CertificateCard({
  cert,
  labels,
  highlight,
}: {
  cert: CertificateView
  labels: CertificatesPageLabels
  highlight?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  // Flash on arrival from the viewer, then settle so the marker isn't permanent.
  const [flash, setFlash] = useState(Boolean(highlight))

  useEffect(() => {
    if (!highlight) return
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    const timer = window.setTimeout(() => setFlash(false), 2400)
    return () => window.clearTimeout(timer)
  }, [highlight])

  return (
    <article
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md transition-all duration-300 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg",
        flash &&
          "-translate-x-0.5 -translate-y-0.5 shadow-hard-lg ring-4 ring-academy-blue ring-offset-2 ring-offset-surface-page"
      )}
    >
      <div className="flex items-start gap-3 border-b-2 border-border-strong bg-academy-yellow-soft p-card">
        <span className="shrink-0 rounded-button border-2 border-border-strong bg-academy-yellow p-2">
          <IconAward aria-hidden className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-card-title font-bold tracking-tight-brand">
            {cert.courseTitle}
          </h2>
          {cert.templateName && (
            <p className="truncate text-sm text-content-muted">
              {cert.templateName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-stack p-card">
        <p className="text-sm font-bold text-content-muted">
          {labels.issuedOn} {formatDate(cert.issuedAt)}
        </p>
        <LazyCertificateDownload cert={cert} labels={labels} />
      </div>
    </article>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconAward
  tone: string
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-card p-4 shadow-hard-sm">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-button border-2 border-border-strong",
          tone
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-none font-bold tabular-nums">{value}</p>
        <p className="truncate text-label font-bold text-content-muted">
          {label}
        </p>
      </div>
    </div>
  )
}
