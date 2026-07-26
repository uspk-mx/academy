import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconBarcode,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconCreditCard,
  IconExternalLink,
  IconLayersSubtract,
  IconReceipt,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link } from "react-router"
import type {
  OrderHistoryPageLabels,
  OrderItemType,
  OrderStatus,
  OrderStatusFilter,
  StudentOrder,
  StudentOrderItem,
} from "../../types/orders"

export interface StudentOrderHistoryPageProps {
  orders: StudentOrder[]
  labels: OrderHistoryPageLabels
  /** Lang-scoped catalog link for the empty state. */
  exploreHref: string
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}

/** Stripe returns lowercase currency codes; Intl wants uppercase. */
function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency.toUpperCase() || "MXN",
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

/**
 * "Historial de Órdenes" — one card per order, items listed inside, since a
 * single checkout can mix courses and bundles.
 *
 * Stats run over the FULL list and only the cards are filtered, so the totals
 * don't shift as you filter or search.
 */
export function StudentOrderHistoryPage({
  orders,
  labels,
  exploreHref,
}: StudentOrderHistoryPageProps) {
  // Local state: the list is already in memory, so filtering client-side costs
  // nothing, while a URL param would revalidate every matched loader.
  const [status, setStatus] = useState<OrderStatusFilter>("all")
  const [query, setQuery] = useState("")

  const allItems = orders.flatMap((order) => order.items)
  const countOfType = (type: OrderItemType) =>
    allItems
      .filter((item) => item.itemType === type)
      .reduce((sum, item) => sum + item.quantity, 0)

  // Net of refunds: an order that came back shouldn't still read as money spent.
  const totalSpent = orders
    .filter(
      (order) =>
        order.status === "completed" ||
        order.status === "partially_refunded" ||
        order.status === "refunded"
    )
    .reduce((sum, order) => sum + order.amount - order.refundedAmount, 0)
  const currency = orders[0]?.currency ?? "mxn"

  const normalisedQuery = query.trim().toLowerCase()
  const visible = orders.filter((order) => {
    // "Reembolsadas" covers both full and partial — a customer looking for a
    // refund doesn't think in those terms.
    if (status === "refunded") {
      if (order.status !== "refunded" && order.status !== "partially_refunded") {
        return false
      }
    } else if (status !== "all" && order.status !== status) {
      return false
    }
    if (!normalisedQuery) return true
    return (
      order.id.toLowerCase().includes(normalisedQuery) ||
      order.items.some((item) =>
        (item.title ?? "").toLowerCase().includes(normalisedQuery)
      )
    )
  })

  const hasOrders = orders.length > 0
  const isFiltering = status !== "all" || normalisedQuery.length > 0
  const showNoResults = hasOrders && visible.length === 0

  const clearFilters = () => {
    setStatus("all")
    setQuery("")
  }

  const filterTabs: { value: OrderStatusFilter; label: string }[] = [
    { value: "all", label: labels.filterAll },
    { value: "completed", label: labels.filterCompleted },
    { value: "pending", label: labels.filterPending },
    { value: "failed", label: labels.filterFailed },
    { value: "refunded", label: labels.filterRefunded },
  ]

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-blue p-2">
            <IconShoppingCart aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              {labels.pageTitle}
            </h1>
            {hasOrders && (
              <p className="text-sm text-content-muted">
                {orders.length}{" "}
                {orders.length === 1
                  ? labels.totalSuffixSingular
                  : labels.totalSuffixPlural}{" "}
                • {labels.spentSuffix}: {formatMoney(totalSpent, currency)}
              </p>
            )}
          </div>
        </div>
      </header>

      {hasOrders && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatTile
              icon={IconShoppingCart}
              tone="bg-academy-blue"
              label={labels.statsTotal}
              value={orders.length}
            />
            <StatTile
              icon={IconReceipt}
              tone="bg-academy-green"
              label={labels.statsSpent}
              value={formatMoney(totalSpent, currency)}
            />
            <StatTile
              icon={IconSparkles}
              tone="bg-academy-yellow"
              label={labels.statsCourses}
              value={countOfType("COURSE")}
            />
            <StatTile
              icon={IconLayersSubtract}
              tone="bg-academy-coral"
              label={labels.statsBundles}
              value={countOfType("BUNDLE")}
            />
            <StatTile
              icon={IconCalendar}
              tone="bg-surface-muted"
              label={labels.statsSubscriptions}
              value={countOfType("SUBSCRIPTION")}
            />
          </div>

          <div className="flex flex-col gap-stack">
            <div className="relative">
              <IconSearch
                aria-hidden
                className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-content-muted"
              />
              <input
                type="search"
                aria-label={labels.searchAria}
                placeholder={labels.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-card border-2 border-border-strong bg-surface-card py-3 pr-4 pl-12 font-bold shadow-hard-xs placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">{labels.filterLabel}</span>
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={status === tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    "rounded-button border-2 border-border-strong px-4 py-2 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                    status === tab.value
                      ? "bg-academy-ink text-content-inverse shadow-hard-sm"
                      : "bg-surface-card shadow-hard-xs"
                  )}
                >
                  {tab.label}
                </button>
              ))}
              <p
                className="ml-2 text-sm font-bold text-content-muted"
                aria-live="polite"
              >
                {visible.length}{" "}
                {visible.length === 1
                  ? labels.resultsSingular
                  : labels.resultsPlural}
              </p>
            </div>
          </div>
        </>
      )}

      {!hasOrders && (
        <EmptyPanel
          icon={IconShoppingCart}
          tone="bg-academy-yellow"
          title={labels.emptyTitle}
          description={labels.emptyDescription}
        >
          <Link
            to={exploreHref}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.emptyCta}
          </Link>
        </EmptyPanel>
      )}

      {showNoResults && (
        <EmptyPanel
          icon={IconSearch}
          tone="bg-surface-muted"
          title={labels.noResultsTitle}
          description={
            normalisedQuery
              ? labels.noResultsWithQuery.replace("{query}", query.trim())
              : labels.noResultsDescription
          }
        >
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.clearFiltersCta}
          </button>
        </EmptyPanel>
      )}

      {visible.length > 0 && (
        <div className="grid gap-stack lg:grid-cols-2">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} labels={labels} />
          ))}
        </div>
      )}

      {isFiltering && hasOrders && visible.length > 0 && (
        <p className="text-center text-label font-bold text-content-muted">
          <button
            type="button"
            onClick={clearFilters}
            className="underline underline-offset-4"
          >
            {labels.clearFiltersCta}
          </button>
        </p>
      )}
    </div>
  )
}

const STATUS_STYLES: Record<OrderStatus, { chip: string; header: string }> = {
  completed: { chip: "bg-academy-green", header: "bg-academy-green-soft" },
  pending: { chip: "bg-academy-yellow", header: "bg-academy-yellow-soft" },
  failed: { chip: "bg-academy-coral", header: "bg-academy-coral-soft" },
  // Refunds are not failures — neutral rather than alarming.
  refunded: { chip: "bg-surface-muted", header: "bg-surface-page" },
  partially_refunded: { chip: "bg-surface-muted", header: "bg-surface-page" },
}

const STATUS_LABEL_KEYS: Record<OrderStatus, keyof OrderHistoryPageLabels> = {
  completed: "statusCompleted",
  pending: "statusPending",
  failed: "statusFailed",
  refunded: "statusRefunded",
  partially_refunded: "statusPartiallyRefunded",
}

const STATUS_ICONS: Record<OrderStatus, typeof IconClock> = {
  completed: IconCircleCheck,
  pending: IconClock,
  failed: IconAlertTriangle,
  refunded: IconArrowBackUp,
  partially_refunded: IconArrowBackUp,
}

function OrderCard({
  order,
  labels,
}: {
  order: StudentOrder
  labels: OrderHistoryPageLabels
}) {
  const createdAt = formatDate(order.createdAt)
  const styles = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
  const statusLabel = String(
    labels[STATUS_LABEL_KEYS[order.status] ?? "statusPending"]
  )
  const StatusIcon = STATUS_ICONS[order.status] ?? IconClock

  const isRefunded =
    order.status === "refunded" || order.status === "partially_refunded"

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const paymentMethod =
    order.cardBrand || order.cardLast4
      ? labels.cardFormat
          .replace("{brand}", capitalise(order.cardBrand ?? ""))
          .replace("{last4}", order.cardLast4 ?? "····")
      : labels.paymentMethodUnknown

  return (
    <article className="flex flex-col overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg">
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b-2 border-border-strong p-card",
          styles.header
        )}
      >
        <div className="min-w-0">
          <p className="text-label font-bold text-content-muted uppercase">
            {labels.orderReference} #{order.id.slice(0, 8)}
          </p>
          <p className="text-sm font-bold">{createdAt ?? "—"}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-pill border-2 border-border-strong px-3 py-1 text-sm font-bold",
            styles.chip
          )}
        >
          <StatusIcon aria-hidden className="size-4" />
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-stack p-card">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-label font-bold text-content-muted uppercase">
              {labels.totalLabel}
            </p>
            <p className="text-3xl leading-none font-bold tabular-nums">
              {formatMoney(order.amount, order.currency)}
            </p>
          </div>
          {itemCount > 0 && (
            <p className="text-sm font-bold text-content-muted">
              {itemCount}{" "}
              {itemCount === 1 ? labels.itemsSingular : labels.itemsPlural}
            </p>
          )}
        </div>

        {isRefunded && (
          <p className="rounded-card border-2 border-border-strong bg-surface-page p-3 text-sm">
            <span className="font-bold">
              {(order.status === "refunded"
                ? labels.refundedNoticeFull
                : labels.refundedNoticePartial
              ).replace(
                "{amount}",
                formatMoney(order.refundedAmount, order.currency)
              )}
            </span>
            {order.status === "refunded" && (
              <span className="block text-content-muted">
                {labels.refundedAccessRevoked}
              </span>
            )}
          </p>
        )}

        {order.voucherUrl || order.voucherReference ? (
          <VoucherPanel order={order} labels={labels} />
        ) : null}

        {order.items.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {order.items.map((item) => (
              <OrderLine
                key={`${item.itemId}-${item.itemType}`}
                item={item}
                labels={labels}
                currency={order.currency}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-card border-2 border-dashed border-border-subtle p-3 text-sm text-content-muted">
            {order.status === "failed"
              ? labels.noItemsFailed
              : labels.noItemsPending}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t-2 border-border-subtle pt-3">
          <div className="flex items-center gap-2 text-sm">
            <IconCreditCard aria-hidden className="size-4 text-content-muted" />
            <span className="font-bold">{paymentMethod}</span>
          </div>
          {order.receiptUrl && (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 text-sm font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            >
              <IconReceipt aria-hidden className="size-4" />
              {labels.receiptCta}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/**
 * OXXO voucher for an unpaid order. The reference is a long number people
 * otherwise retype by hand at the counter, so it gets a copy button and
 * `tabular-nums`; the hosted page is the printable/reprintable version.
 */
function VoucherPanel({
  order,
  labels,
}: {
  order: StudentOrder
  labels: OrderHistoryPageLabels
}) {
  const [copied, setCopied] = useState(false)

  const expiresAt = order.voucherExpiresAt
    ? new Date(order.voucherExpiresAt)
    : null
  const hasExpiry = expiresAt !== null && !Number.isNaN(expiresAt.getTime())
  const isExpired = hasExpiry && expiresAt.getTime() < Date.now()

  const copyReference = async () => {
    if (!order.voucherReference) return
    try {
      await navigator.clipboard.writeText(order.voucherReference)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the
      // reference is on screen to copy by hand, so there is nothing to report.
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-card border-2 border-border-strong bg-academy-yellow-soft p-3">
      <div className="flex items-center gap-2">
        <IconBarcode aria-hidden className="size-5" />
        <h3 className="font-bold">{labels.voucherTitle}</h3>
      </div>

      <p className="text-label text-content-muted">{labels.voucherHelp}</p>

      {order.voucherReference && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-label font-bold text-content-muted uppercase">
              {labels.voucherReferenceLabel}
            </p>
            <p className="truncate font-bold tabular-nums">
              {order.voucherReference}
            </p>
          </div>
          <button
            type="button"
            onClick={copyReference}
            className="inline-flex shrink-0 items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 text-sm font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {copied ? (
              <IconCircleCheck aria-hidden className="size-4" />
            ) : (
              <IconCopy aria-hidden className="size-4" />
            )}
            {copied ? labels.voucherCopiedCta : labels.voucherCopyCta}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={cn(
            "text-label font-bold",
            isExpired ? "text-academy-coral" : "text-content-muted"
          )}
        >
          {isExpired
            ? labels.voucherExpiredLabel
            : hasExpiry
              ? labels.voucherExpiresLabel.replace(
                  "{date}",
                  dateFormatter.format(expiresAt)
                )
              : ""}
        </p>
        {order.voucherUrl && (
          <a
            href={order.voucherUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 text-sm font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <IconExternalLink aria-hidden className="size-4" />
            {labels.voucherOpenCta}
          </a>
        )}
      </div>
    </section>
  )
}

function OrderLine({
  item,
  labels,
  currency,
}: {
  item: StudentOrderItem
  labels: OrderHistoryPageLabels
  currency: string
}) {
  const typeLabel =
    item.itemType === "BUNDLE"
      ? labels.typeBundle
      : item.itemType === "SUBSCRIPTION"
        ? labels.typeSubscription
        : labels.typeCourse

  return (
    <li className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-page p-2">
      <span className="size-12 shrink-0 overflow-hidden rounded-button border-2 border-border-strong bg-surface-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <IconSparkles aria-hidden className="size-5 text-content-muted" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block font-bold">
          {item.title ?? `${typeLabel} ${item.itemId.slice(0, 8)}`}
        </span>
        <span className="text-label text-content-muted">
          {typeLabel}
          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold tabular-nums">
        {formatMoney(item.unitPrice * item.quantity, currency)}
      </span>
    </li>
  )
}

function capitalise(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconClock
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
        <p className="truncate text-xl leading-none font-bold tabular-nums">
          {value}
        </p>
        <p className="truncate text-label font-bold text-content-muted">
          {label}
        </p>
      </div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: typeof IconClock
  tone: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
      <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-card border-2 border-border-strong",
            tone
          )}
        >
          <Icon aria-hidden className="size-8" />
        </span>
        <h2 className="text-card-title font-bold tracking-tight-brand">
          {title}
        </h2>
        <p className="text-content-muted">{description}</p>
        {children}
      </div>
    </div>
  )
}
