import { IconInbox } from "@tabler/icons-react"
import type { ReactNode } from "react"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"

/**
 * The "nothing here yet" panel every list page falls back to. `action` may be
 * either a link (`href`) or a callback — dialog-driven pages need the latter.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  href,
  onAction,
  icon,
}: {
  title: string
  description?: string
  actionLabel?: string
  href?: string
  onAction?: () => void
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-border-strong bg-surface-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-yellow-soft shadow-hard-xs">
        {icon ?? <IconInbox className="size-5" />}
      </span>
      <h2 className="text-card-title leading-display font-bold tracking-tight-brand">
        {title}
      </h2>
      {description && (
        <p className="max-w-sm text-sm text-content-muted">{description}</p>
      )}
      {actionLabel &&
        (href ? (
          <BrandButton to={href} variant="promo" className="mt-1">
            {actionLabel}
          </BrandButton>
        ) : onAction ? (
          <BrandButton onClick={onAction} variant="promo" className="mt-1">
            {actionLabel}
          </BrandButton>
        ) : null)}
    </div>
  )
}
