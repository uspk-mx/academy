/**
 * Loads the `@react-pdf`-backed `CertificateActions` on demand, client-side.
 *
 * The renderer is heavy (~1.4MB) and the course viewer is on the hot path, so
 * it must never sit in the lesson/quiz chunk. This wrapper only *type*-imports
 * the actions (erased at build) and pulls the real module via a dynamic
 * `import()` once mounted — the PDF chunk is fetched just for the finished
 * courses that actually show a certificate.
 */
import { cn } from "@academy/user-ui/lib/utils"
import { IconDownload } from "@tabler/icons-react"
import { useEffect, useState, type ComponentType } from "react"
import type { CertificateActionsProps } from "./certificate-actions"

export function LazyCertificateDownload(props: CertificateActionsProps) {
  const [Comp, setComp] =
    useState<ComponentType<CertificateActionsProps> | null>(null)

  useEffect(() => {
    let active = true
    void import("./certificate-actions").then((mod) => {
      if (active) setComp(() => mod.CertificateActions)
    })
    return () => {
      active = false
    }
  }, [])

  if (!Comp) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 text-sm font-bold shadow-hard-xs opacity-60"
        )}
      >
        <IconDownload aria-hidden className="size-4" />
        {props.labels.download}
      </span>
    )
  }

  return <Comp {...props} />
}
