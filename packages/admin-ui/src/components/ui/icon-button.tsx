import * as React from "react"
import { Link } from "react-router"

import { cn } from "@academy/admin-ui/lib/utils"

const base =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-button border-2 border-transparent text-content-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-50"

/**
 * Square, low-emphasis action used inside rows and card headers, where a full
 * BrandButton (hard shadow + bold label) would shout. Renders a Link when `to`
 * is set, matching BrandButton's API.
 */
export function IconButton({
  className,
  destructive,
  to,
  ...props
}: React.ComponentProps<"button"> & { destructive?: boolean; to?: string }) {
  const classes = cn(
    base,
    destructive &&
      "hover:border-academy-coral hover:bg-academy-coral-soft hover:text-content-primary",
    className
  )

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={props["aria-label"]}>
        {props.children}
      </Link>
    )
  }

  return <button type="button" className={classes} {...props} />
}
