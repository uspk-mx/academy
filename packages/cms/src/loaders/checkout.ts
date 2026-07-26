import { getLocale } from "@academy/user-ui/lib/lang"
import { getCheckoutPage } from "../graphql/queries/checkout"

export async function loadCheckoutPage(lang: string) {
  const locale = getLocale(lang)
  const { checkoutPages } = await getCheckoutPage({ variables: { locale } })
  const checkoutPage = checkoutPages[0]

  return {
    checkoutLabels: {
      cancelLabel: checkoutPage.cancelLabel,
      cancelHref: checkoutPage.cancelHref,
      pageTitle: checkoutPage.pageTitle,
      billingTitle: checkoutPage.billingTitle,
      billingCountryLabel: checkoutPage.billingCountryLabel,
      billingLegalText: checkoutPage.billingLegalText,
      paymentTitle: checkoutPage.paymentTitle,
      paymentSecureLabel: checkoutPage.paymentSecureLabel,
      submitLabel: checkoutPage.submitLabel ?? "Completar compra",
      submittingLabel: checkoutPage.processingLabel ?? "Procesando…",
    },
    summaryLabels: {
      summaryTitle: checkoutPage.summaryTitle,
      summaryOriginalPrice: checkoutPage.summaryOriginalPrice,
      summaryDiscount: checkoutPage.summaryDiscount,
      summaryFinalPrice: checkoutPage.summaryFinalPrice,
      summaryTotal: checkoutPage.summaryTotal,
      summaryTermsText: checkoutPage.summaryTermsText,
      summaryTermsLabel: checkoutPage.summaryTermsLabel,
      summaryTermsHref: checkoutPage.summaryTermsHref,
      guaranteeTitle: checkoutPage.guaranteeTitle,
      guaranteeDescription: checkoutPage.guaranteeDescription,
      socialProofTitle: checkoutPage.socialProofTitle,
      socialProofText: checkoutPage.socialProofText,
    },
    orderDetailsLabel: checkoutPage.orderDetailsLabel,
    // "{amount}" is replaced client-side with the formatted total.
    paymentLabels: {
      payCta: checkoutPage.payCta ?? "Pagar {amount}",
      processingLabel: checkoutPage.processingLabel ?? "Procesando…",
      preparingLabel: checkoutPage.preparingLabel ?? "Preparando el pago seguro…",
      loadingLabel: checkoutPage.loadingLabel ?? "Cargando…",
      paymentErrorText:
        checkoutPage.paymentErrorText ??
        "No se pudo procesar el pago. Intenta de nuevo.",
      initErrorText:
        checkoutPage.initErrorText ??
        "No se pudo iniciar el pago. Intenta de nuevo.",
      missingCartError: checkoutPage.missingCartError ?? "Falta el carrito.",
      submitLabel: checkoutPage.submitLabel ?? "Completar compra",
      freeSubmitLabel: checkoutPage.freeSubmitLabel ?? "Completar inscripción",
      cardMethodLabel: checkoutPage.cardMethodLabel ?? "Tarjetas",
      oxxoMethodLabel: checkoutPage.oxxoMethodLabel ?? "OXXO",
    },
  }
}

export type CheckoutPaymentLabels = Awaited<
  ReturnType<typeof loadCheckoutPage>
>["paymentLabels"]
