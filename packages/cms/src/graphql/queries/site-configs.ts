import { cmsAPIClient } from "../../api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const GET_SITE_CONFIGS = graphql(`
  query SiteConfigs($locales: [Locale!]!) {
    siteConfigs(locales: $locales) {
      createdAt
      ctaHref
      ctaLabel
      facebookUrl
      footerTagline
      footerCopyright
      whatsappUrl
      updatedAt
      tiktokUrl
      stage
      publishedAt
      instagramUrl
      id
      loginHref
      loginLabel
      navLinksJson
      footerColumnsJson
    }
  }
`)

export type SiteConfigData = ResultOf<typeof GET_SITE_CONFIGS>
export type SiteConfigVariables = VariablesOf<typeof GET_SITE_CONFIGS>

export async function getSiteConfigs({
  variables,
}: {
  variables: SiteConfigVariables
}): Promise<SiteConfigData> {
  return cmsAPIClient(GET_SITE_CONFIGS, variables)
}
