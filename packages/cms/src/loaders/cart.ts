import { getLocale } from "@academy/user-ui/lib/lang"
import { getCartPage } from "../graphql/queries/cart"

export async function loadCartPage(lang: string) {
  const locale = getLocale(lang)
  const { cartPages } = await getCartPage({ variables: { locale } })
  const cartPage = cartPages[0]

  const count = 1

  return {
    title: cartPage.pageTitle,
    ...cartPage,
    emptyTitle: cartPage.emptyTitle,
    emptyDescription: cartPage.emptyDescription,
    emptyCta: cartPage.emptyCta,
    emptyCtaHref: cartPage.emptyCtaHref,
    itemCountLabel: cartPage.itemCountLabel
      ?.replace("{n}", String(count))
      .replace(
        count === 1 ? "cursos" : "curso", // fix singular/plural
        count === 1 ? "curso" : "cursos"
      ),
    itemSaveLabel: cartPage.itemSaveLabel,
    itemRemoveLabel: cartPage.itemRemoveLabel,
    summaryTitle: cartPage.summaryTitle,
    summaryTotalToPayLabel: cartPage.summaryTotalToPayLabel,
    summaryCurrentPrice: cartPage.summaryCurrentPrice,
    summaryOriginalPrice: cartPage.summaryOriginalPrice,
    summaryCheckoutCta: cartPage.summaryCheckoutCta,
    summaryCouponLabel: cartPage.summaryCouponLabel,
    summaryCouponPlaceholder: cartPage.summaryCouponPlaceholder,
    recommendationsTitle: cartPage.recommendationsTitle,
    recommendationsCta: cartPage.recommendationsCta,
    recommendationsCtaHref: cartPage.recommendationsCtaHref,
    itemLabels: {
      bundleBadge: cartPage.bundleBadge ?? "Paquete",
      subscriptionBadge: cartPage.subscriptionBadge ?? "Suscripción",
      freeBadge: cartPage.freeBadge ?? "Gratis",
      studentsLabel: cartPage.studentsLabel ?? "estudiantes",
      outOfStockText: cartPage.outOfStockText ?? "No disponible por el momento",
    },
    notChargedYetText: cartPage.notChargedYetText ?? "Todavía no se te cobrará",
    removeErrorText:
      cartPage.removeErrorText ?? "No se pudo remover el artículo.",
    freeIncludedSingular:
      cartPage.freeIncludedSingular ??
      "Incluye 1 curso gratis — se activa al completar tu compra, sin costo.",
    freeIncludedPlural:
      cartPage.freeIncludedPlural ??
      "Incluye {n} cursos gratis — se activan al completar tu compra, sin costo.",
    freeCartTitle: cartPage.freeCartTitle ?? "Todo listo para empezar",
    freeCartTextSingular:
      cartPage.freeCartTextSingular ??
      "1 curso gratis — no necesitas datos de pago.",
    freeCartTextPlural:
      cartPage.freeCartTextPlural ??
      "{n} cursos gratis — no necesitas datos de pago.",
    freeCartEnrollCta: cartPage.freeCartEnrollCta ?? "Inscribirme gratis",
    freeCartStartNote:
      cartPage.freeCartStartNote ?? "Empiezas a aprender de inmediato.",
  }
}
