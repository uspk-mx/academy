/**
 * Course details page labels: breadcrumbs, section headings, purchase card and
 * the add-to-cart / enrollment dialogs that open from this page — fetched from
 * the Hygraph `CourseDetailsPage` model, falling back to the defaults below.
 * The dialog fields live flat on the model (one shared `goToCartCta`).
 */
import { getLocale } from "@academy/user-ui/lib/lang"
import { getCourseDetailsPage } from "../graphql/queries/course-details"
import { fillLabels } from "./label-utils"

export interface CourseDetailsLabels {
  breadcrumbHome: string
  breadcrumbCourses: string
  levelPrefix: string
  studentsLabel: string
  lessonsLabel: string
  learnTitle: string
  learnEmptyText: string
  descriptionTitle: string
  requirementsTitle: string
  relatedTitle: string
  relatedSubtitle: string
  courseSingular: string
  coursePlural: string
  purchase: {
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
  dialogs: {
    addedToCartTitle: string
    boughtTogetherTitle: string
    enrolledTitle: string
    goToCartCta: string
    goToCoursesCta: string
    keepShoppingCta: string
  }
  cartItem: {
    itemSaveLabel: string
    itemRemoveLabel: string
    bundleBadge: string
    subscriptionBadge: string
    freeBadge: string
    studentsLabel: string
    outOfStockText: string
  }
}

export const defaultCourseDetailsLabels: CourseDetailsLabels = {
  breadcrumbHome: "Home",
  breadcrumbCourses: "Cursos",
  levelPrefix: "Nivel",
  studentsLabel: "estudiantes",
  lessonsLabel: "lecciones",
  learnTitle: "Lo que vas a aprender",
  learnEmptyText:
    "Muy pronto publicaremos los objetivos de este curso. Mientras tanto, revisa la descripción para conocer los temas.",
  descriptionTitle: "Descripción",
  requirementsTitle: "Requisitos",
  relatedTitle: "Los estudiantes también compran",
  relatedSubtitle: "Cursos que suelen llevarse junto con este",
  courseSingular: "curso",
  coursePlural: "cursos",
  purchase: {
    buyTabLabel: "Comprar curso",
    buyTabHint: "Pago único",
    subscribeTabLabel: "Suscribirme",
    subscribeTabHint: "240+ cursos",
    purchaseModeAria: "Forma de compra",
    freeLabel: "Gratis",
    offerEndsPrefix: "Oferta termina en",
    previewLabel: "Vista previa",
    previewDialogTitle: "Vista previa del curso",
    previewAriaPrefix: "Ver vista previa de",
    noPreviewText: "Sin video de vista previa",
    accountNote: "Podrás crear tu cuenta al pagar.",
    needAccountText: "Necesitas una cuenta para inscribirte.",
    createFreeAccountCta: "Crea una gratis",
    guaranteeLabel: "Garantía 30 días",
    securePaymentLabel: "Pago seguro",
    includesTitle: "Incluye",
    continueCta: "Continuar el curso",
    enrollFreeCta: "Inscribirme gratis",
    buyNowCta: "Comprar ahora",
    addToCartCta: "Añadir al carrito",
    goToCartCta: "Ir al carrito",
    trialCta: "Probar por 7 días",
  },
  dialogs: {
    addedToCartTitle: "Agregado al carrito",
    boughtTogetherTitle: "Comprados juntos con frecuencia",
    enrolledTitle: "Inscripto al curso",
    goToCartCta: "Ir al carrito",
    goToCoursesCta: "Ir a tus cursos",
    keepShoppingCta: "Continuar comprando",
  },
  cartItem: {
    itemSaveLabel: "",
    itemRemoveLabel: "",
    bundleBadge: "Paquete",
    subscriptionBadge: "Suscripción",
    freeBadge: "Gratis",
    studentsLabel: "estudiantes",
    outOfStockText: "No disponible por el momento",
  },
}

export async function loadCourseDetailsLabels(
  lang: string
): Promise<CourseDetailsLabels> {
  const locale = getLocale(lang)
  const d = defaultCourseDetailsLabels
  try {
    const { courseDetailsPages } = await getCourseDetailsPage({
      variables: { locale },
    })
    const cms = (courseDetailsPages[0] ?? null) as Record<
      string,
      unknown
    > | null
    const { purchase, dialogs, cartItem, ...page } = d
    return {
      ...fillLabels(page, cms),
      purchase: fillLabels(purchase, cms),
      dialogs: fillLabels(dialogs, cms),
      // The row badges aren't modeled on CourseDetailsPage; shared fields
      // (studentsLabel) fill in, the rest keep defaults.
      cartItem: fillLabels(cartItem, cms),
    }
  } catch {
    return d
  }
}
