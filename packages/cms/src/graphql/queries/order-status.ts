import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const ORDER_STATUS_PAGE_QUERY = graphql(`
  query GetOrderStatusPages($locale: Locale!) {
    orderStatusPages(locales: [$locale, en]) {
      completedTitle
      completedDescription
      pendingTitle
      pendingDescription
      failedTitle
      failedDescription
      startLearningCta
      retryCta
      backHomeCta
    }
  }
`)

export type OrderStatusPageData = ResultOf<typeof ORDER_STATUS_PAGE_QUERY>
export type OrderStatusPageVariables = VariablesOf<
  typeof ORDER_STATUS_PAGE_QUERY
>

export async function getOrderStatusPage({
  variables,
}: {
  variables: OrderStatusPageVariables
}): Promise<OrderStatusPageData> {
  return cmsAPIClient(ORDER_STATUS_PAGE_QUERY, variables)
}
