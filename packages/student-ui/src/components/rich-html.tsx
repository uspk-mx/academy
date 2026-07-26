import { cn } from "@academy/user-ui/lib/utils"
import { memo } from "react"

export interface RichHtmlProps {
  /** Pre-sanitized HTML (the loader runs sanitize-html before it reaches here). */
  html: string
  className?: string
}

/**
 * Renders sanitized instructor HTML (lesson bodies, quiz question descriptions).
 *
 * Memoized on the html string on purpose: these bodies can embed a `<video>`
 * (sometimes a multi-megabyte base64 data URI). Without memo, an unrelated
 * parent re-render — the quiz timer ticking every second, a draft answer
 * changing — reconciles this subtree and the browser restarts the video,
 * making it "jump" and never play. With memo the DOM node is left completely
 * alone until the html itself changes.
 *
 * The content is first-party (authored by instructors in the admin editor) and
 * sanitized in the route loader, so `dangerouslySetInnerHTML` is the intended
 * mechanism here.
 */
export const RichHtml = memo(function RichHtml({
  html,
  className,
}: RichHtmlProps) {
  return (
    <div
      className={cn("prose-academy max-w-none", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized in the loader
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})
