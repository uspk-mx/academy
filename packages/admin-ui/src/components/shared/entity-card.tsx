import { IconDots } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { Link } from "react-router"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@academy/user-ui/components/ui/dropdown-menu"
import { cn } from "@academy/admin-ui/lib/utils"

export interface EntityCardAction {
  label: string
  href?: string
  onSelect?: () => void
  destructive?: boolean
}

/**
 * Shared card for the grid pages (courses, bundles, learning paths, plans).
 * `media` is optional so text-only entities like plans reuse the same frame.
 */
export function EntityCard({
  title,
  href,
  imageUrl,
  eyebrow,
  description,
  footer,
  actions,
  children,
}: {
  title: string
  href?: string
  imageUrl?: string | null
  eyebrow?: ReactNode
  description?: string | null
  footer?: ReactNode
  actions?: EntityCardAction[]
  children?: ReactNode
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-xs transition-[translate,box-shadow] duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm">
      {imageUrl !== undefined && (
        <div className="aspect-video w-full overflow-hidden border-b-2 border-border-strong bg-academy-yellow-soft">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-full items-center justify-center"
            >
              <span className="font-heading text-3xl font-medium italic">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-card-sm">
        {eyebrow && (
          <div className="flex flex-wrap items-center gap-1.5 text-label text-content-muted">
            {eyebrow}
          </div>
        )}

        <h3 className="line-clamp-2 pr-8 text-card-title leading-display font-bold tracking-tight-brand">
          {href ? (
            <Link to={href} className="underline-offset-2 hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        {description && (
          <p className="line-clamp-2 text-sm text-content-muted">
            {description}
          </p>
        )}

        {children}

        {footer && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm">
            {footer}
          </div>
        )}
      </div>

      {actions?.length ? (
        <div className="absolute top-2.5 right-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-button border-2 border-border-strong bg-surface-card shadow-hard-xs transition-colors hover:bg-academy-yellow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                />
              }
              aria-label={`Acciones de ${title}`}
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-card border-2 border-border-strong bg-surface-card shadow-hard-sm"
            >
              {actions.map((action) =>
                action.href ? (
                  <DropdownMenuItem
                    key={action.label}
                    render={<Link to={action.href} />}
                    className="rounded-[calc(var(--radius-card)-6px)] font-semibold data-highlighted:bg-academy-yellow-soft"
                  >
                    {action.label}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={action.onSelect}
                    className={cn(
                      "rounded-[calc(var(--radius-card)-6px)] font-semibold data-highlighted:bg-academy-yellow-soft",
                      action.destructive &&
                        "text-academy-coral data-highlighted:bg-academy-coral-soft data-highlighted:text-content-primary"
                    )}
                  >
                    {action.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </article>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  )
}
