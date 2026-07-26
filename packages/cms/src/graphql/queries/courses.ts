import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const COURSES_PAGE_QUERY = graphql(`
  query GetCourses($locale: Locale!) {
    coursesPages(locales: [$locale, en]) {
      heroBadge
      heroTitle
      heroSubtitle
      heroSearchPlaceholder
      heroCards
      filterTitle
      filterClearLabel
      filterSpecialtyLabel
      filterLevelLabel
      filterDurationLabel
      filterPriceLabel
      filterDurationShort
      filterDurationMedium
      filterDurationLong
      resultsLabel
      searchAria
      searchSubmitLabel
      resultsAria
      paginationAria
      prevPageLabel
      nextPageLabel
      pageLabel
      maxPriceAria
      upsellTitle
      upsellDescription
      upsellCtaLabel
      upsellCtaHref
    }
  }
`)

export type CoursesPageData = ResultOf<typeof COURSES_PAGE_QUERY>
export type CoursesPageVariables = VariablesOf<typeof COURSES_PAGE_QUERY>

export async function getCoursesPage({
  variables,
}: {
  variables: CoursesPageVariables
}): Promise<CoursesPageData> {
  return cmsAPIClient(COURSES_PAGE_QUERY, variables)
}
