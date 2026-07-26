import { CourseBySlugData } from "@academy/courses-api/graphql/queries/course"
import type { Cart } from "@academy/user-ui/types/api"
import { IconShoppingCart } from "@tabler/icons-react"
import { useFetcher, useParams } from "react-router"
import {
  AddToCartResult,
  RemoveCartResult,
} from "../../../../courses-api/src/graphql/mutations/cart"
import { BrandButton } from "../brand/brand-button"
import {
  CartItemRow,
  CartSummary,
  EmptyCartIllustration,
  EmptyCartNotice,
} from "../cart/cart-components"
import { CourseGrid , type CourseCardLabels } from "../course/course-card"
import { PromoBanner } from "../marketing/banners"

export interface CartPageProps {
  cart: Cart
  requireSession: (enroll: () => void) => () => void | Promise<void>
  recommendedCourses: CourseBySlugData["courseBySlug"][]
  promo?: {
    message: string
    endsAt: string
    bgColor: string
    showTimer: boolean
  }
  /** Enrolls the free lines directly (all-free carts never reach /pagar). */
  onEnrollFree?: () => void
  onCheckout: () => void
  onApplyCoupon?: () => void
  pageLabels: {
    title: string
    emptyTitle: string
    emptyDescription: string
    emptyCta: string
    emptyCtaHref: string
    itemCountLabel: string
    itemSaveLabel: string
    itemRemoveLabel: string
    summaryTitle: string
    summaryCurrentPrice: string
    summaryOriginalPrice: string
    summaryCheckoutCta: string
    summaryCouponLabel: string
    summaryCouponPlaceholder: string
    summaryTotalToPayLabel: string
    bundleBadge: string
    subscriptionBadge: string
    freeBadge: string
    studentsLabel: string
    outOfStockText: string
    notChargedYetText: string
    freeIncludedSingular: string
    freeIncludedPlural: string
    freeCartTitle: string
    freeCartTextSingular: string
    freeCartTextPlural: string
    freeCartEnrollCta: string
    freeCartStartNote: string
    recommendationsTitle: string
    recommendationsCta: string
    recommendationsCtaHref: string
  }
  cardLabels?: CourseCardLabels
}

export function CartPage({
  cart,
  recommendedCourses,
  promo,
  requireSession,
  onEnrollFree,
  onCheckout,
  onApplyCoupon,
  pageLabels,
  cardLabels,
}: CartPageProps) {
  const isEmpty = cart.items.length === 0
  const { lang } = useParams()
  const removeItem = useFetcher<RemoveCartResult>()
  const addToCart = useFetcher<
    AddToCartResult["addToCart"]["items"][number] | null
  >()

  return (
    <main className="bg-surface-page">
      {promo && (
        <PromoBanner
          bgColor={promo.bgColor}
          message={promo.message}
          endsAt={promo.endsAt}
          showTimer={promo.showTimer}
        />
      )}

      <div className="mx-auto px-page-x py-stack-lg">
        <h1 className="flex items-center gap-2 text-card-title font-bold tracking-tight-brand">
          <IconShoppingCart aria-hidden className="size-5" />
          {pageLabels.title}
        </h1>
        {isEmpty ? (
          <div className="mt-stack grid items-start gap-stack-lg md:grid-cols-[1fr_auto]">
            <EmptyCartNotice
              title={pageLabels.emptyTitle}
              description={pageLabels.emptyDescription}
              cta={{
                label: pageLabels.emptyCta,
                href: pageLabels.emptyCtaHref,
              }}
            />
            <EmptyCartIllustration className="hidden md:block" />
          </div>
        ) : (
          <div className="mt-stack grid items-start gap-stack-lg lg:grid-cols-[1fr_16rem]">
            <div className="flex flex-col gap-stack">
              <p className="text-sm font-bold">{pageLabels.itemCountLabel}</p>
              <ul className="flex flex-col gap-stack">
                {cart.items.map((line) => (
                  <li key={line.id}>
                    <CartItemRow
                      line={line}
                      onRemove={(itemId) => {
                        removeItem.submit(
                          { intent: "removeFromCart", itemId },
                          { method: "post" }
                        )
                      }}
                      labels={pageLabels}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <CartSummary
              cart={cart}
              onCheckout={onCheckout}
              onApplyCoupon={onApplyCoupon}
              onEnrollFree={onEnrollFree}
              className="lg:sticky lg:top-6"
              labels={{ ...pageLabels }}
            />
          </div>
        )}
      </div>

      <section aria-labelledby="cross-sell-heading" className="mt-stack-lg">
        <h2
          id="cross-sell-heading"
          className="mx-auto px-page-x pb-stack text-section-title leading-display font-bold tracking-display"
        >
          {pageLabels.recommendationsTitle}
        </h2>
        <div className="border-y-2 border-border-strong bg-surface-promo">
          <div className="mx-auto px-page-x py-stack-lg">
            <CourseGrid
              courses={recommendedCourses}
              variant="commerce"
              onAddToCart={(courseId) => {
                addToCart.submit(
                  { intent: "addToCart", courseId },
                  { method: "post" }
                )
              }}
              onEnrollFree={(courseId) =>
                requireSession(() => console.log("enroll free", courseId))()
              }
              columns={3}
              labels={cardLabels}
          />
          </div>
        </div>
        <div className="mx-auto px-page-x py-stack-lg">
          <BrandButton
            variant="primary"
            size="lg"
            withArrow
            to={`/${lang}/${pageLabels.recommendationsCtaHref}`}
          >
            {pageLabels.recommendationsCta}
          </BrandButton>
        </div>
      </section>
    </main>
  )
}
