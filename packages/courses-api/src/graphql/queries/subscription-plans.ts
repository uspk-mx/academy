import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../graphql"

/**
 * All subscription plans, for the marketing memberships page. Public — the
 * resolver allows anonymous visitors (plans carry no user data); subscribing
 * still requires auth.
 */
export const SUBSCRIPTION_PLANS_QUERY = graphql(`
  query SubscriptionPlans {
    subscriptionPlans {
      id
      planName
      planDescription
      price
      duration
      category {
        id
        name
      }
    }
  }
`)

export type SubscriptionPlansData = ResultOf<typeof SUBSCRIPTION_PLANS_QUERY>

export async function getSubscriptionPlans(
  request: Request
): Promise<SubscriptionPlansData> {
  return coursesApiClient(request, SUBSCRIPTION_PLANS_QUERY, {})
}
