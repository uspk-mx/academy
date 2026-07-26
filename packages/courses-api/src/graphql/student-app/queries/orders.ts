import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * The caller's purchases, newest first.
 *
 * Card details and the receipt link are captured from Stripe when the payment
 * settles and stored on the transaction, so this never triggers a Stripe call.
 * Orders that were abandoned before reaching Stripe are filtered out server-side.
 */
export const MY_ORDERS_QUERY = graphql(`
  query MyOrders {
    myOrders {
      id
      status
      amount
      currency
      cardBrand
      cardLast4
      receiptUrl
      createdAt
      refundedAmount
      refundedAt
      voucherUrl
      voucherReference
      voucherExpiresAt
      items {
        itemType
        itemId
        quantity
        unitPrice
        title
        featuredImage
      }
    }
  }
`)

export type MyOrdersResult = ResultOf<typeof MY_ORDERS_QUERY>

export async function getMyOrders(
  request: Request
): Promise<MyOrdersResult | null> {
  try {
    return await coursesApiClient(request, MY_ORDERS_QUERY, {})
  } catch {
    return null
  }
}
