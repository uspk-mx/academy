import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const ORDER_STATUS_QUERY = graphql(`
  query OrderStatus($sessionId: ID!) {
    orderStatus(sessionId: $sessionId) {
      status
      amount
      currency
      items {
        title
        featuredImage
        unitPrice
        quantity
        itemId
        itemType
      }
    }
  }
`)

export type OrderStatusResult = ResultOf<typeof ORDER_STATUS_QUERY>
export type OrderStatusVariables = VariablesOf<typeof ORDER_STATUS_QUERY>

export async function orderStatus({
  request,
  variables,
}: {
  request: Request
  variables: OrderStatusVariables
}) {
  return coursesApiClient(request, ORDER_STATUS_QUERY, variables)
}
