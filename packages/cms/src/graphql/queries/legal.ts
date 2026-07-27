import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const LEGAL_PAGE_QUERY = graphql(`
  query LegalPage($locale: Locale!, $slug: String!) {
    termsAndCondition(where: { slug: $slug }, locales: [$locale]) {
      heading
      id
      slug
      lastUpdated
      lastUpdatedLabel
      updatedAt
      content {
        __typename
        raw
      }
    }
  }
`)

export type LegalPageData = ResultOf<typeof LEGAL_PAGE_QUERY>
export type LegalPageVariables = VariablesOf<typeof LEGAL_PAGE_QUERY>

export async function getLegalPage({
  variables,
}: {
  variables: LegalPageVariables
}): Promise<LegalPageData> {
  return cmsAPIClient(LEGAL_PAGE_QUERY, variables)
}
