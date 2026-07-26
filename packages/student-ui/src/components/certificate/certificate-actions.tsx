/**
 * Download / preview buttons for one certificate.
 *
 * The PDF is generated in the browser with `usePDF`, so everything here is
 * client-only: a `mounted` gate keeps `usePDF` (which touches Blob/URL) from
 * running during SSR, showing a disabled placeholder until hydration. Each card
 * owns its own generator; the document is tiny, so the handful a student can
 * hold costs nothing to render up front.
 */
import { cn } from "@academy/user-ui/lib/utils"
import { usePDF } from "@react-pdf/renderer"
import { IconDownload, IconEye } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import type { CertificatesPageLabels, CertificateView } from "../../types/certificate"
import { CertificateDocument } from "./certificate-document"

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-button border-2 border-border-strong px-4 py-2 text-sm font-bold shadow-hard-xs transition-all duration-150 ease-academy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
const btnEnabled =
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
const btnDisabled = "cursor-not-allowed opacity-60"

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "certificado"
  )
}

export interface CertificateActionsProps {
  cert: CertificateView
  labels: CertificatesPageLabels
}

export function CertificateActions({ cert, labels }: CertificateActionsProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className={cn(btnBase, btnDisabled, "bg-academy-yellow")}>
          <IconDownload aria-hidden className="size-4" />
          {labels.download}
        </span>
      </div>
    )
  }

  return <ReadyActions cert={cert} labels={labels} />
}

function ReadyActions({ cert, labels }: CertificateActionsProps) {
  const document = useMemo(
    () => <CertificateDocument cert={cert} labels={labels.doc} />,
    [cert, labels.doc]
  )
  const [instance] = usePDF({ document })

  const filename = `${slugify(cert.courseTitle)}-certificado.pdf`
  const busy = instance.loading || !instance.url
  const failed = Boolean(instance.error)

  if (failed) {
    return (
      <p className="text-sm font-bold text-academy-coral" role="alert">
        {labels.generationError}
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {busy ? (
        <span
          className={cn(btnBase, btnDisabled, "bg-academy-yellow")}
          aria-live="polite"
        >
          <IconDownload aria-hidden className="size-4" />
          {labels.generating}
        </span>
      ) : (
        <a
          href={instance.url ?? undefined}
          download={filename}
          className={cn(btnBase, btnEnabled, "bg-academy-yellow")}
        >
          <IconDownload aria-hidden className="size-4" />
          {labels.download}
        </a>
      )}

      <a
        href={busy ? undefined : (instance.url ?? undefined)}
        target="_blank"
        rel="noreferrer"
        aria-disabled={busy}
        className={cn(
          btnBase,
          busy ? btnDisabled : btnEnabled,
          "bg-surface-card"
        )}
      >
        <IconEye aria-hidden className="size-4" />
        {labels.preview}
      </a>
    </div>
  )
}
