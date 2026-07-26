import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const CART_QUERY = graphql(`
  query GetCartPages($locale: Locale!) {
    cartPages(locales: [$locale, en]) {
      announcementText
      announcementBgColor
      announcementShowTimer
      pageTitle
      emptyTitle
      emptyDescription
      emptyCta
      emptyCtaHref
      itemCountLabel
      itemSaveLabel
      itemRemoveLabel
      bundleBadge
      subscriptionBadge
      freeBadge
      studentsLabel
      outOfStockText
      notChargedYetText
      removeErrorText
      freeIncludedSingular
      freeIncludedPlural
      freeCartTitle
      freeCartTextSingular
      freeCartTextPlural
      freeCartEnrollCta
      freeCartStartNote
      summaryTitle
      summaryCurrentPrice
      summaryOriginalPrice
      summaryCheckoutCta
      summaryCouponLabel
      summaryCouponPlaceholder
      summaryTotalToPayLabel
      recommendationsTitle
      recommendationsCta
      recommendationsCtaHref
    }
  }
`)

export type CartPageData = ResultOf<typeof CART_QUERY>
export type CartPageVariables = VariablesOf<typeof CART_QUERY>

export async function getCartPage({
  variables,
}: {
  variables: CartPageVariables
}): Promise<CartPageData> {
  return cmsAPIClient(CART_QUERY, variables)
}
