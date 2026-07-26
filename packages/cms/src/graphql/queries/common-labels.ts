import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const COMMON_LABELS_QUERY = graphql(`
  query GetCommonLabels($locale: Locale!) {
    commonLabelsList(locales: [$locale, en]) {
      freeLabel
      customPriceLabel
      addToCartLabel
      enrollFreeLabel
      newBadgeLabel
    }
  }
`)

export type CommonLabelsData = ResultOf<typeof COMMON_LABELS_QUERY>
export type CommonLabelsVariables = VariablesOf<typeof COMMON_LABELS_QUERY>

export async function getCommonLabels({
  variables,
}: {
  variables: CommonLabelsVariables
}): Promise<CommonLabelsData> {
  return cmsAPIClient(COMMON_LABELS_QUERY, variables)
}
