import { cmsAPIClient } from "../../api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const CTA_BANNER_QUERY = graphql(`
  query GetCtaBanners($locales: [Locale!]!) {
    ctaBanners(locales: $locales) {
      headlineLines
      description
      primaryCtaLabel
      primaryCtaHref
      secondaryCtaLabel
      secondaryCtaHref
      portraits
    }
  }
`)

export type CTABannerData = ResultOf<typeof CTA_BANNER_QUERY>
export type CTABannerVariables = VariablesOf<typeof CTA_BANNER_QUERY>

export async function getCTABanner({
  variables,
}: {
  variables: CTABannerVariables
}): Promise<CTABannerData> {
  return cmsAPIClient(CTA_BANNER_QUERY, variables)
}
