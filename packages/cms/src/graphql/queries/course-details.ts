import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const COURSE_DETAILS_PAGE_QUERY = graphql(`
  query GetCourseDetailsPages($locale: Locale!) {
    courseDetailsPages(locales: [$locale, en]) {
      breadcrumbHome
      breadcrumbCourses
      levelPrefix
      studentsLabel
      lessonsLabel
      learnTitle
      learnEmptyText
      descriptionTitle
      requirementsTitle
      relatedTitle
      relatedSubtitle
      courseSingular
      coursePlural
      buyTabLabel
      buyTabHint
      subscribeTabLabel
      subscribeTabHint
      purchaseModeAria
      freeLabel
      offerEndsPrefix
      previewLabel
      previewDialogTitle
      previewAriaPrefix
      noPreviewText
      accountNote
      needAccountText
      createFreeAccountCta
      guaranteeLabel
      securePaymentLabel
      includesTitle
      continueCta
      enrollFreeCta
      buyNowCta
      addToCartCta
      goToCartCta
      trialCta
      addedToCartTitle
      boughtTogetherTitle
      enrolledTitle
      goToCoursesCta
      keepShoppingCta
    }
  }
`)

export type CourseDetailsPageData = ResultOf<typeof COURSE_DETAILS_PAGE_QUERY>
export type CourseDetailsPageVariables = VariablesOf<
  typeof COURSE_DETAILS_PAGE_QUERY
>

export async function getCourseDetailsPage({
  variables,
}: {
  variables: CourseDetailsPageVariables
}): Promise<CourseDetailsPageData> {
  return cmsAPIClient(COURSE_DETAILS_PAGE_QUERY, variables)
}
