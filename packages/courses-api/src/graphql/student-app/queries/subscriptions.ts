import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * The logged-in user's active subscription (if any). The resolver scopes to the
 * authenticated user and ignores the argument, but the schema still requires it.
 * `cancelAtPeriodEnd` is read from Stripe, so the card can say "renews" vs "ends".
 */
export const ACTIVE_USER_SUBSCRIPTION_QUERY = graphql(`
  query ActiveUserSubscription($userId: ID!) {
    activeUserSubscription(userId: $userId) {
      id
      startDate
      endDate
      isActive
      cancelAtPeriodEnd
      plan {
        id
        planName
        planDescription
        price
        duration
      }
    }
  }
`)

export type ActiveUserSubscriptionResult = ResultOf<
  typeof ACTIVE_USER_SUBSCRIPTION_QUERY
>

export async function getActiveUserSubscription(
  request: Request,
  userId: string
): Promise<ActiveUserSubscriptionResult | null> {
  try {
    return await coursesApiClient(request, ACTIVE_USER_SUBSCRIPTION_QUERY, {
      userId,
    })
  } catch {
    return null
  }
}
