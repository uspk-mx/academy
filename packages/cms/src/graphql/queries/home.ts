import { cmsAPIClient } from "../../api-client"
import { graphql, type ResultOf, type VariablesOf } from "../graphql"

export const GET_HOME = graphql(`
  query HomePages($locales: [Locale!]!) {
    homePages(locales: $locales) {
      createdAt
      companyLogos {
        id
        href
        createdAt
        order
        published
        alt
        logo {
          fileName
          createdAt
          height
          id
          mimeType
          size
          width
          url
        }
      }
      featureCardsJson
      pricingPlansJson
      featureEyebrow
      featureTitle
      heroDisclaimer
      heroPrimaryCtaHref
      heroPrimaryCtaLabel
      heroSecondaryCtaHref
      heroSecondaryCtaLabel
      heroTitle
      heroSubtitle
      heroImage {
        id
        width
        height
        url
        size
        fileName
      }
      id
      locale
      logosTitle
      pricingEyebrow
      pricingSubtitle
      pricingTitle
      publishedAt
      stage
      unitTeaserDescription
      unitTeaserStreakLabel
      unitTeaserTitle
      unitTeaserUnitLabel
      updatedAt
      unitTeaserCharacterImage {
        fileName
        height
        handle
        id
        mimeType
        size
        url
        width
      }
      showPricingSection
      showTestimonialsSection
      showCompaniesSection
      testimonials {
        authorName
        authorRole
        id
        order
        quote
        quoteEmphasis

        avatar {
          fileName
          id
          mimeType
          size
          width
          url
        }
      }
    }
  }
`)

export type HomeData = ResultOf<typeof GET_HOME>
export type HomeDataVariables = VariablesOf<typeof GET_HOME>

export async function getHomeData({
  variables,
}: {
  variables: HomeDataVariables
}): Promise<HomeData> {
  return cmsAPIClient(GET_HOME, variables)
}
