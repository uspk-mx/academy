import { CartData } from "@academy/courses-api/graphql/queries/cart"
import { useCountdown } from "@academy/user-ui/hooks/use-countdown"
import { loginHref, signupHref } from "@academy/user-ui/lib/auth"
import { cn } from "@academy/user-ui/lib/utils"
import {
  AuthState,
  compareAtPrice,
  CourseDetail,
  courseTone,
  discountPercent,
  effectivePrice,
  EnrollmentStatus,
  formatPrice,
} from "@academy/user-ui/types/api"
import {
  IconCheck,
  IconPlayerPlay,
  IconShieldCheck,
  IconStopwatch,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import { BrandButton } from "../brand/brand-button"
import { HardCard, toneSoftBg } from "../brand/primitives"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

type PurchaseMode = "buy" | "subscribe"

/** CMS copy; matches the future Hygraph CourseDetailsPage purchase fields. */
export interface PurchaseCardLabels {
  buyTabLabel: string
  buyTabHint: string
  subscribeTabLabel: string
  subscribeTabHint: string
  purchaseModeAria: string
  freeLabel: string
  offerEndsPrefix: string
  previewLabel: string
  previewDialogTitle: string
  previewAriaPrefix: string
  noPreviewText: string
  accountNote: string
  needAccountText: string
  createFreeAccountCta: string
  guaranteeLabel: string
  securePaymentLabel: string
  includesTitle: string
  continueCta: string
  enrollFreeCta: string
  buyNowCta: string
  addToCartCta: string
  goToCartCta: string
  trialCta: string
}

export interface PurchaseCardProps {
  course: CourseDetail
  auth: AuthState
  enrollment: EnrollmentStatus
  onBuyNow: (courseId: string) => void
  onAddToCart: (courseId: string) => void
  /** Free courses enroll directly — no cart, no checkout. */
  onEnrollFree?: (courseId: string) => void
  onPreview?: (courseId: string) => void
  className?: string
  cart: CartData | null
  labels: PurchaseCardLabels
}

/** Sticky purchase sidebar on the course detail page: preview tile,
 *  buy/subscribe tabs, price + offer countdown, CTAs and includes list. */
export function PurchaseCard({
  course,
  auth,
  enrollment,
  onBuyNow,
  onAddToCart,
  onPreview,
  onEnrollFree,
  className,
  cart,
  labels,
}: PurchaseCardProps) {
  const [mode, setMode] = useState<PurchaseMode>("buy")
  const { lang } = useParams()
  const { pathname } = useLocation()
  const isFree = course.pricingType === "FREE"
  const countdown = useCountdown(course.offerEndsAt)
  const isAnonymous = auth.status === "anonymous"
  const isEnrolled = enrollment !== "none"
  const isItemInCart = cart?.cart?.items.some(
    (item) => item.itemId === course.id
  )

  return (
    <HardCard
      as="aside"
      shadow="md"
      className={cn("overflow-hidden", className)}
    >
      <div className="border-b-2 border-border-strong p-card-sm">
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className={cn(
                  "group relative mx-auto w-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                  className
                )}
                aria-label={`${labels.previewAriaPrefix} ${course.title}`}
              >
                <div className="w-full rounded-card border-2 border-border-strong bg-surface-card p-1 shadow-hard-xs transition-transform duration-200 ease-academy group-hover:rotate-0">
                  {course.featuredImage ? (
                    <img
                      src={course.featuredImage}
                      alt=""
                      loading="lazy"
                      className="aspect-16/10 w-full rounded-[calc(var(--radius-card)-6px)] object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className={cn(
                        "flex aspect-16/10 w-full items-center justify-center rounded-[calc(var(--radius-card)-6px)]",
                        toneSoftBg[courseTone(course)]
                      )}
                    >
                      <span className="font-heading text-3xl font-medium italic">
                        {course.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 skew-x-6 items-center gap-1 rounded-pill border-2 border-border-strong bg-surface-card px-2.5 py-0.5 text-label font-bold">
                    <IconPlayerPlay
                      aria-hidden
                      className="size-3 fill-current"
                    />{" "}
                    {labels.previewLabel}
                  </span>
                </div>
              </button>
            }
          />
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{labels.previewDialogTitle}</DialogTitle>
              <DialogDescription>{course.title}</DialogDescription>
            </DialogHeader>
            {course.video?.videoURL ? (
              <video
                src={course.video?.videoURL ?? ""}
                controls
                preload="metadata"
                className="aspect-video w-full border-2 border-border-strong bg-academy-ink object-cover shadow-hard-sm"
              />
            ) : (
              <p className="text-academy-ink">{labels.noPreviewText}</p>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!isFree && (
        <div
          role="tablist"
          aria-label={labels.purchaseModeAria}
          className="grid grid-cols-2 border-b-2 border-border-strong"
        >
          {(
            [
              {
                id: "buy",
                label: labels.buyTabLabel,
                hint: labels.buyTabHint,
              },
              {
                id: "subscribe",
                label: labels.subscribeTabLabel,
                hint: labels.subscribeTabHint,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-3 text-sm font-bold tracking-tight-brand transition-colors first:border-r-2 first:border-border-strong focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-academy-blue",
                mode === tab.id
                  ? "bg-academy-yellow"
                  : "bg-surface-card hover:bg-surface-muted"
              )}
            >
              {tab.label}
              <span className="text-label font-medium text-content-muted">
                {tab.hint}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-stack p-card">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold tracking-tight-brand">
            {course.pricingType === "FREE"
              ? labels.freeLabel
              : formatPrice(effectivePrice(course))}
          </span>
          {compareAtPrice(course) != null && (
            <s className="text-sm font-semibold text-content-muted">
              {formatPrice(compareAtPrice(course)!)}
            </s>
          )}
          {discountPercent(course) != null && (
            <span className="rounded-pill bg-academy-coral px-2 py-0.5 text-label font-bold text-content-inverse">
              -{discountPercent(course)}%
            </span>
          )}
        </p>

        {countdown && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-academy-coral">
            <IconStopwatch aria-hidden className="size-4" />
            {labels.offerEndsPrefix} {countdown}
          </p>
        )}

        <ActionButtons
          labels={labels}
          courseSlug={course.slug ?? ""}
          courseId={course.id}
          onEnrollFree={(courseId) => onEnrollFree?.(courseId)}
          onBuyNow={() => onBuyNow(course.id)}
          onAddToCart={() => onAddToCart(course.id)}
          lang={lang}
          pathname={pathname}
          flags={{
            isBuyMode: mode === "buy",
            isEnrolled,
            isItemInCart: isItemInCart || false,
            isAnonymous,
            isFree,
          }}
        />
        {!isEnrolled && isAnonymous && (
          <p className="text-center text-label text-content-muted">
            {isFree ? (
              <>
                {labels.needAccountText}{" "}
                <Link
                  to={signupHref(lang ?? "es", pathname)}
                  className="font-semibold text-action-secondary underline-offset-2 hover:underline"
                >
                  {labels.createFreeAccountCta}
                </Link>
                .
              </>
            ) : (
              labels.accountNote
            )}
          </p>
        )}
        {!isFree && (
          <p className="flex items-center justify-between border-t border-border-subtle pt-stack text-label text-content-muted">
            <span>{course.guaranteeLabel ?? labels.guaranteeLabel}</span>
            <span className="inline-flex items-center gap-1">
              <IconShieldCheck aria-hidden className="size-3.5" />{" "}
              {labels.securePaymentLabel}
            </span>
          </p>
        )}

        {/* Includes — pending API field, hidden when absent */}
        {course.includes && course.includes.length > 0 && (
          <section aria-labelledby="incluye-heading">
            <h3
              id="incluye-heading"
              className="text-label font-bold tracking-tight-brand uppercase"
            >
              {labels.includesTitle}
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {course.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-content-muted"
                >
                  <IconCheck
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-academy-green"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </HardCard>
  )
}

function ActionButtons({
  labels,
  courseSlug,
  courseId,
  onAddToCart,
  onEnrollFree,
  onBuyNow,
  flags: { isEnrolled, isItemInCart, isBuyMode, isFree, isAnonymous },
  lang,
  pathname,
}: {
  labels: PurchaseCardLabels
  courseSlug: string
  courseId: string
  onBuyNow: () => void
  onEnrollFree: (courseId: string) => void
  onAddToCart: () => void
  flags: {
    isEnrolled: boolean
    isItemInCart: boolean
    isBuyMode: boolean
    isFree: boolean
    isAnonymous: boolean
  }
  lang?: string
  pathname?: string
}) {
  if (isEnrolled) {
    return (
      <BrandButton
        variant="primary"
        size="lg"
        to={`/${lang ?? "es"}/dashboard/courses/${courseSlug}`}
        reloadDocument
        className="w-full"
      >
        {labels.continueCta}
      </BrandButton>
    )
  }

  if (isFree && isAnonymous) {
    return (
      <BrandButton
        variant="primary"
        size="lg"
        withArrow
        to={loginHref(lang ?? "es", pathname ?? "")}
        className="w-full"
      >
        {labels.enrollFreeCta}
      </BrandButton>
    )
  }

  if (isFree && !isAnonymous) {
    return (
      <BrandButton
        variant="primary"
        size="lg"
        withArrow
        onClick={() => (onEnrollFree ?? onBuyNow)(courseId)}
        className="w-full"
      >
        {labels.enrollFreeCta}
      </BrandButton>
    )
  }

  if (isBuyMode && !isItemInCart) {
    return (
      <>
        <BrandButton
          variant="promo"
          size="lg"
          onClick={onBuyNow}
          className="w-full"
        >
          {labels.buyNowCta}
        </BrandButton>

        <BrandButton
          variant="outline"
          size="lg"
          onClick={onAddToCart}
          className="w-full"
        >
          {labels.addToCartCta}
        </BrandButton>
      </>
    )
  }
  if (isBuyMode && isItemInCart) {
    return (
      <BrandButton
        variant="outline"
        size="lg"
        to={`/${lang}/cart`}
        className="w-full"
      >
        {labels.goToCartCta}
      </BrandButton>
    )
  }

  return (
    <BrandButton
      variant="secondary"
      size="lg"
      to="/#precios"
      className="w-full"
    >
      {labels.trialCta}
    </BrandButton>
  )
}
