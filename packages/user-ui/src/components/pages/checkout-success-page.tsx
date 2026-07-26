import { formatPrice } from "@academy/user-ui/types/api"
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
} from "@tabler/icons-react"
import { BrandButton } from "../brand/brand-button"

/** Matches the backend `OrderStatus.status` (pending | completed | failed). */
export type OrderStatus = "pending" | "completed" | "failed"

export interface OrderItem {
  title: string
  featuredImage?: string | null
  unitPrice: number
  quantity: number
}

/** CMS-provided copy; shape matches the future Hygraph OrderStatusPage model. */
export interface OrderStatusLabels {
  completedTitle: string
  completedDescription: string
  pendingTitle: string
  pendingDescription: string
  failedTitle: string
  failedDescription: string
  startLearningCta: string
  retryCta: string
  backHomeCta: string
}

export interface CheckoutSuccessPageProps {
  status: OrderStatus
  /** Purchased lines, shown once the order is known. */
  items?: OrderItem[]
  /** Lang-scoped hrefs supplied by the route. */
  coursesHref: string
  homeHref: string
  retryHref: string
  labels: OrderStatusLabels
}

/** Order-status page for `/checkout/success`. The route resolves the status
 *  from `orderStatus(sessionId)` and re-polls while it's still `pending`. */
export function CheckoutSuccessPage({
  status,
  items,
  coursesHref,
  homeHref,
  retryHref,
  labels,
}: CheckoutSuccessPageProps) {
  const copy: Record<OrderStatus, { title: string; description: string }> = {
    completed: {
      title: labels.completedTitle,
      description: labels.completedDescription,
    },
    pending: {
      title: labels.pendingTitle,
      description: labels.pendingDescription,
    },
    failed: {
      title: labels.failedTitle,
      description: labels.failedDescription,
    },
  }
  const { title, description } = copy[status]

  return (
    <main className="grid min-h-svh place-items-center bg-surface-page px-page-x py-stack-lg">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-stack text-center">
        {status === "completed" && (
          <IconCircleCheck className="size-14 text-action-primary" aria-hidden />
        )}
        {status === "pending" && (
          <IconLoader2
            className="size-14 animate-spin text-academy-blue"
            aria-hidden
          />
        )}
        {status === "failed" && (
          <IconAlertTriangle
            className="size-14 text-content-primary"
            aria-hidden
          />
        )}

        <h1 className="text-section-title leading-display font-bold tracking-display">
          {title}
        </h1>
        <p className="text-content-muted leading-body">{description}</p>

        {items && items.length > 0 && status !== "failed" && (
          <OrderItems items={items} />
        )}

        <div className="mt-stack flex flex-wrap items-center justify-center gap-stack">
          {status === "completed" && (
            <BrandButton variant="primary" size="lg" to={coursesHref}>
              {labels.startLearningCta}
            </BrandButton>
          )}
          {status === "failed" && (
            <BrandButton variant="primary" size="lg" to={retryHref}>
              {labels.retryCta}
            </BrandButton>
          )}
          <BrandButton variant="outline" size="lg" to={homeHref}>
            {labels.backHomeCta}
          </BrandButton>
        </div>
      </div>
    </main>
  )
}

function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="mt-stack flex w-full flex-col gap-stack rounded-card border-2 border-border-strong bg-surface-card p-card-sm text-left">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="flex items-center gap-stack">
          {item.featuredImage && (
            <img
              src={item.featuredImage}
              alt=""
              className="h-12 w-12 shrink-0 rounded-button border-2 border-border-strong object-cover"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-bold">
            {item.title}
          </span>
          <span className="shrink-0 text-sm">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        </li>
      ))}
    </ul>
  )
}
