import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const CHECKOUT_QUERY = graphql(`
  query GetCheckoutPages($locale: Locale!) {
    checkoutPages(locales: [$locale, en]) {
      cancelLabel
      cancelHref
      pageTitle
      billingTitle
      billingCountryLabel
      billingLegalText
      paymentTitle
      paymentSecureLabel
      payCta
      processingLabel
      preparingLabel
      loadingLabel
      paymentErrorText
      initErrorText
      missingCartError
      submitLabel
      freeSubmitLabel
      cardMethodLabel
      oxxoMethodLabel
      summaryTitle
      summaryOriginalPrice
      summaryDiscount
      summaryFinalPrice
      summaryTotal
      summaryTermsText
      summaryTermsLabel
      summaryTermsHref
      guaranteeTitle
      guaranteeDescription
      socialProofTitle
      socialProofText
      orderDetailsLabel
      id
      createdAt
    }
  }
`)

export type CheckoutPageData = ResultOf<typeof CHECKOUT_QUERY>
export type CheckoutPageVariables = VariablesOf<typeof CHECKOUT_QUERY>

export async function getCheckoutPage({
  variables,
}: {
  variables: CheckoutPageVariables
}): Promise<CheckoutPageData> {
  return cmsAPIClient(CHECKOUT_QUERY, variables)
}
