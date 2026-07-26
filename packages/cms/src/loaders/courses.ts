import { getLocale } from "@academy/user-ui/lib/lang"
import {
  CatalogCategoryCard,
  CatalogHeroContent,
  CatalogUpsellContent,
  TitleSegment,
} from "@academy/user-ui/types/cms"
import { getCoursesPage } from "../graphql/queries/courses"

export interface CoursesPageData {
  hero: CatalogHeroContent
  upsell: CatalogUpsellContent
  filters: {
    title: string
    clearLabel: string
    specialtyLabel: string
    levelLabel: string
    durationLabel: string
    priceLabel: string
    durationOptions: { short: string; medium: string; long: string }
  }
  resultsLabel: string
  /** Screen-reader/navigation labels. */
  a11y: {
    searchAria: string
    searchSubmitLabel: string
    resultsAria: string
    paginationAria: string
    prevPageLabel: string
    nextPageLabel: string
    pageLabel: string
    maxPriceAria: string
  }
}

export async function loadCoursesPage(lang: string): Promise<CoursesPageData> {
  const locale = getLocale(lang)
  const { coursesPages } = await getCoursesPage({
    variables: { locale: locale },
  })

  const c = coursesPages[0]

  return {
    hero: {
      promoBadge: c?.heroBadge ?? "",
      title: c?.heroTitle as unknown as TitleSegment[],
      subtitle: c?.heroSubtitle ?? "",
      searchPlaceholder: c?.heroSearchPlaceholder ?? "",
      cards: c?.heroCards as unknown as CatalogCategoryCard[],
    },
    upsell: {
      title: c?.upsellTitle ?? "",
      description: c?.upsellDescription ?? "",
      cta: { label: c?.upsellCtaLabel ?? "", href: c?.upsellCtaHref ?? "" },
    },
    filters: {
      title: c?.filterTitle ?? "",
      clearLabel: c?.filterClearLabel ?? "",
      specialtyLabel: c?.filterSpecialtyLabel ?? "",
      levelLabel: c?.filterLevelLabel ?? "",
      durationLabel: c?.filterDurationLabel ?? "",
      priceLabel: c?.filterPriceLabel ?? "",
      durationOptions: {
        short: c?.filterDurationShort ?? "",
        medium: c?.filterDurationMedium ?? "",
        long: c?.filterDurationLong ?? "",
      },
    },
    resultsLabel: c?.resultsLabel ?? "",
    // "{n}" is replaced with the page number.
    a11y: {
      searchAria: c?.searchAria ?? "Buscar cursos",
      searchSubmitLabel: c?.searchSubmitLabel ?? "Buscar",
      resultsAria: c?.resultsAria ?? "Resultados de cursos",
      paginationAria: c?.paginationAria ?? "Paginación",
      prevPageLabel: c?.prevPageLabel ?? "Página anterior",
      nextPageLabel: c?.nextPageLabel ?? "Página siguiente",
      pageLabel: c?.pageLabel ?? "Página {n}",
      maxPriceAria: c?.maxPriceAria ?? "Precio máximo",
    },
  }
}
