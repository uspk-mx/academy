import { IconChevronRight } from "@tabler/icons-react"
import { Link } from "react-router"

import { cn } from "@academy/admin-ui/lib/utils"

export interface BreadcrumbItem {
  label: string
  /** Omitted on the last (current) crumb. */
  href?: string
}

/**
 * Every admin page opens with the same trail. Data-driven rather than
 * composable parts because no page needs anything else.
 */
export function PageBreadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-label", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="font-semibold text-content-muted underline-offset-2 transition-colors hover:text-content-primary hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast ? "font-bold" : "font-semibold text-content-muted"
                  }
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <IconChevronRight
                  aria-hidden
                  className="size-3.5 text-content-muted"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
