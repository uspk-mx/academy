import { cn } from "@academy/user-ui/lib/utils"
import type { Cart, CartLine } from "@academy/user-ui/types/api"
import {
  averageRating,
  cartMode,
  cartSavings,
  courseTone,
  formatPrice,
  isFreeCartLine
} from "@academy/user-ui/types/api"
import {
  IconCheck,
  IconInfoCircle,
  IconUsers
} from "@tabler/icons-react"
import { Link, useParams } from "react-router"
import { BrandButton } from "../brand/brand-button"
import {
  CoverFrame,
  HardCard,
  Pill,
  RatingStars
} from "../brand/primitives"
import { Skeleton } from "../ui/skeleton"

interface EmptyCartNoticeProps {
  className?: string
  title: string
  description: string
  cta: {
    label: string
    href: string
  }
}

export function EmptyCartNotice({
  title,
  description,
  cta,
  className,
}: EmptyCartNoticeProps) {
  const { lang } = useParams()
  return (
    <div
      className={cn(
        "relative max-w-xl rounded-card border-2 border-border-strong bg-surface-card p-card-sm shadow-hard-xs",
        className
      )}
    >
      <div className="flex items-start gap-stack">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-green-soft text-academy-green">
          <IconInfoCircle aria-hidden className="size-5" strokeWidth={2.5} />
        </span>
        <div className="text-sm leading-body">
          <p className="font-bold">{title}</p>
          <p className="text-content-muted">
            {description}{" "}
            <Link
              to={`/${lang}/${cta.href}`}
              className="font-semibold text-academy-coral underline underline-offset-4"
            >
              {cta.label}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function EmptyCartIllustration({ className }: { className?: string }) {
  return (
    <HardCard aria-hidden className={cn("relative p-stack-lg", className)}>
      <img
        src="https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/images/sad-empty-bag.svg"
        alt="empty cart"
        className="w-full"
      />
      <span className="absolute -bottom-3 -left-3 flex size-8 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-blue text-content-inverse">
        +
      </span>
    </HardCard>
  )
}

export interface CartItemRowProps {
  line: CartLine
  onRemove: (courseId: string) => void
  className?: string
  labels: {
    itemSaveLabel: string
    itemRemoveLabel: string
    bundleBadge: string
    subscriptionBadge: string
    freeBadge: string
    studentsLabel: string
    outOfStockText: string
  }
  showActions?: boolean
  showStockMessage?: boolean
}

export function CartItemRow({
  line,
  onRemove,
  className,
  labels,
  showActions = true,
  showStockMessage = true,
}: CartItemRowProps) {
  const { item } = line
  const isFree = isFreeCartLine(line)
  const lineTotal = line.unitPrice * line.quantity
  const { lang } = useParams()

  /* Regular (struck) price per union member */
  const regularUnit =
    item.__typename === "CourseBundle"
      ? (item.subtotalRegularPrice ?? undefined)
      : item.__typename === "Course" && item.price > line.unitPrice
        ? item.price
        : undefined

  const rating =
    item.__typename === "Course" ? averageRating(item.reviews) : undefined
  const students =
    item.__typename === "Course" ? item.enrollments?.length : undefined

  const tone =
    item.__typename === "Course"
      ? courseTone(item)
      : item.__typename === "CourseBundle"
        ? "blue"
        : "yellow"

  return (
    <HardCard as="article" shadow="md" className={cn("p-card-sm", className)}>
      <div
        className={cn(
          "flex flex-col gap-stack sm:flex-row sm:items-center",
          line.inStock === false && "opacity-70"
        )}
      >
        <div className="relative shrink-0 self-start pl-2">
          {item.__typename === "Course" && item.level && (
            <Pill className="absolute -top-1 -left-1 z-10">
              {item.level.name}
            </Pill>
          )}
          <div className="group w-28">
            <CoverFrame
              imageUrl={
                "featuredImage" in item ? item.featuredImage : undefined
              }
              fallback={(item.__typename === "SubscriptionPlan"
                ? item.planName
                : item.title
              ).charAt(0)}
              tone={tone}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {item.__typename !== "Course" ? (
            <Pill
              tone={item.__typename === "CourseBundle" ? "blue" : "yellow"}
              className="mb-1"
            >
              {item.__typename === "CourseBundle"
                ? labels.bundleBadge
                : labels.subscriptionBadge}
            </Pill>
          ) : (
            isFree && (
              <Pill tone="green" className="mb-1">
                {labels.freeBadge}
              </Pill>
            )
          )}

          <h2 className="text-card-title font-bold tracking-tight-brand">
            {item.__typename === "Course" ? (
              item.slug ? (
                <Link
                  to={`/${lang}/courses/${item.slug}`}
                  className="hover:underline"
                >
                  {item.title}
                </Link>
              ) : (
                item.title
              )
            ) : item.__typename === "CourseBundle" ? (
              item.title
            ) : (
              item.planName
            )}
            {line.quantity > 1 && (
              <span className="ml-2 text-sm font-semibold text-content-muted">
                × {line.quantity}
              </span>
            )}
          </h2>

          {item.__typename === "Course" && item.shortDescription && (
            <p className="mt-1 text-sm text-content-muted">
              {item.shortDescription}
            </p>
          )}
          {(rating || students != null) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-content-muted">
              {rating && (
                <span className="inline-flex items-center gap-1.5">
                  <RatingStars rating={rating.rating} />({rating.count})
                </span>
              )}
              {students != null && students > 0 && (
                <span className="inline-flex items-center gap-1">
                  <IconUsers aria-hidden className="size-3.5" />
                  {students.toLocaleString("es-MX")} {labels.studentsLabel}
                </span>
              )}
            </div>
          )}
          {line.notes && (
            <p className="mt-1.5 text-label text-content-muted italic">
              {line.notes}
            </p>
          )}
          {line.inStock === false && showStockMessage && (
            <p className="mt-1.5 text-label font-bold text-academy-coral">
              {labels.outOfStockText}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex shrink-0 items-center justify-between gap-stack sm:flex-col sm:items-end">
            <div className="flex flex-col items-end gap-0.5 text-label font-semibold text-academy-blue">
              <button
                type="button"
                onClick={() => onRemove(line.id)}
                className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
              >
                {labels.itemRemoveLabel}
              </button>
            </div>
            {isFree ? (
              <p className="text-right">
                <span className="block font-bold text-academy-green">
                  Gratis
                </span>
                <span className="text-label text-content-muted">
                  Incluido en tu orden
                </span>
              </p>
            ) : (
              <p className="text-right">
                <span className="block font-bold">
                  {formatPrice(lineTotal)}
                </span>
                {regularUnit != null && (
                  <s className="text-sm text-content-muted">
                    {formatPrice(regularUnit * line.quantity)}
                  </s>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </HardCard>
  )
}

export interface CartSummaryProps {
  cart: Cart
  onCheckout: () => void
  /** All-free carts enroll directly — no checkout, no payment data. */
  onEnrollFree?: () => void
  onApplyCoupon?: () => void
  className?: string
  labels: {
    summaryTitle: string
    summaryCurrentPrice: string
    summaryOriginalPrice: string
    summaryCheckoutCta: string
    summaryCouponLabel: string
    summaryCouponPlaceholder: string
    summaryTotalToPayLabel: string
    notChargedYetText: string
    /** "{n}" is replaced with the free-course count. */
    freeIncludedSingular: string
    freeIncludedPlural: string
    freeCartTitle: string
    freeCartTextSingular: string
    freeCartTextPlural: string
    freeCartEnrollCta: string
    freeCartStartNote: string
  }
}

export function CartSummary({
  cart,
  onCheckout,
  onEnrollFree,
  onApplyCoupon,
  className,
  labels,
}: CartSummaryProps) {
  const mode = cartMode(cart)
  const savings = cartSavings(cart)
  const freeCount = cart.items.filter(isFreeCartLine).length

  /* All-free cart: enrollment framing — no prices, no payment reassurance */
  if (mode === "free") {
    return (
      <HardCard as="aside" shadow="md" className={cn("p-card", className)}>
        <h2 className="text-base font-bold tracking-tight-brand">
          {labels.freeCartTitle}
        </h2>
        <p className="mt-1 text-sm text-content-muted">
          {(freeCount === 1
            ? labels.freeCartTextSingular
            : labels.freeCartTextPlural
          ).replace("{n}", String(freeCount))}
        </p>
        <BrandButton
          variant="primary"
          withArrow
          onClick={onEnrollFree ?? onCheckout}
          className="mt-stack w-full"
        >
          {labels.freeCartEnrollCta}
        </BrandButton>
        <p className="mt-2 text-center text-label text-content-muted">
          {labels.freeCartStartNote}
        </p>
      </HardCard>
    )
  }

  return (
    <HardCard as="aside" shadow="md" className={cn("p-card", className)}>
      <h2 className="text-sm font-bold">{labels.summaryTitle}</h2>
      <dl className="mt-1 flex flex-col gap-0.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt>{labels.summaryCurrentPrice}</dt>
          <dd className="font-bold">{formatPrice(cart.subtotal)}</dd>
        </div>
        {savings && (
          <>
            <div className="flex justify-between gap-2 text-content-muted">
              <dt>{labels.summaryOriginalPrice}</dt>
              <dd>
                <s>{formatPrice(savings.compareAtTotal)}</s>
              </dd>
            </div>
            <div className="flex justify-between gap-2 font-bold text-academy-coral">
              <dt>{labels.summaryCouponLabel}</dt>
              <dd>{savings.discountPercent}% OFF</dd>
            </div>
          </>
        )}
        {cart.tax > 0 && (
          <div className="flex justify-between gap-2">
            <dt>IVA:</dt>
            <dd>{formatPrice(cart.tax)}</dd>
          </div>
        )}
        <div className="mt-1 flex justify-between gap-2 border-t border-border-subtle pt-1.5 text-base">
          <dt className="font-bold">{labels.summaryTotalToPayLabel}</dt>
          <dd className="font-bold">{formatPrice(cart.total)}</dd>
        </div>
      </dl>

      {/* Mixed cart: free items ride along, activated with the purchase */}
      {freeCount > 0 && (
        <p className="mt-2 flex items-start gap-1.5 text-label text-content-muted">
          <IconCheck
            aria-hidden
            className="mt-px size-3.5 shrink-0 text-academy-green"
            strokeWidth={3}
          />
          {(freeCount === 1
            ? labels.freeIncludedSingular
            : labels.freeIncludedPlural
          ).replace("{n}", String(freeCount))}
        </p>
      )}

      <BrandButton
        variant="primary"
        withArrow
        onClick={onCheckout}
        className="mt-stack w-full"
      >
        {labels.summaryCheckoutCta}
      </BrandButton>
      <p className="mt-2 text-center text-label text-content-muted">
        {labels.notChargedYetText}
      </p>

      {onApplyCoupon && (
        <button
          type="button"
          onClick={onApplyCoupon}
          className="mt-stack w-full rounded-button border-2 border-academy-blue px-4 py-2 text-sm font-bold text-academy-blue hover:bg-academy-blue-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          {labels.summaryCouponLabel}
        </button>
      )}
    </HardCard>
  )
}

export function CartItemRowSkeleton() {
  return (
    <HardCard as="article" shadow="md" className="p-card-sm">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="relative shrink-0 self-start pl-2">
            <Skeleton className="h-20 w-24 rounded-xl" />
        </div>

        <div className="min-w-0 ml-4 flex-1 flex flex-col items-start gap-3">
          <Skeleton className="h-4 w-50" />
          <Skeleton className="h-4 w-62.5" />
        </div>
      </div>
    </HardCard>
  )
}
