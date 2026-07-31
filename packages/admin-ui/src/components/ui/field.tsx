import * as React from "react"

import { Label } from "@academy/user-ui/components/ui/label"
import { cn } from "@academy/admin-ui/lib/utils"

/**
 * Label + control + hint/error — the shape every admin form row takes. Matches
 * the marketing AuthField treatment so forms read the same across the apps: the
 * error replaces the hint rather than stacking, so rows never shift twice.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  error?: string | null
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm font-bold">
          {label}
          {required && <span className="text-academy-coral">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-label font-semibold text-academy-coral">{error}</p>
      ) : hint ? (
        <p className="text-label text-content-muted">{hint}</p>
      ) : null}
    </div>
  )
}

/** Input styling shared by every admin form control, so a `<select>` or a
 *  textarea sits flush with the branded `Input`. */
export const controlClasses =
  "w-full rounded-button border-2 border-border-strong bg-surface-card px-4 shadow-hard-xs transition-[translate,box-shadow] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-academy-coral"
