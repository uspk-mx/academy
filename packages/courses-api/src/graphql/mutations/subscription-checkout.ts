import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../graphql"
import { apiClient } from "@academy/courses-api/api-client"

/**
 * Starts a Stripe subscription-mode checkout for one plan (B2C recurring) and
 * returns the `clientSecret` for the embedded Stripe checkout. Requires auth.
 */
export const CREATE_SUBSCRIPTION_CHECKOUT = graphql(`
  mutation CreateSubscriptionCheckout($planId: ID!) {
    createSubscriptionCheckout(planId: $planId) {
      id
      url
      clientSecret
    }
  }
`)

export type CreateSubscriptionCheckoutData = ResultOf<
  typeof CREATE_SUBSCRIPTION_CHECKOUT
>
export type CreateSubscriptionCheckoutVariables = VariablesOf<
  typeof CREATE_SUBSCRIPTION_CHECKOUT
>

export async function createSubscriptionCheckout({
  request,
  variables,
}: {
  request: Request
  variables: CreateSubscriptionCheckoutVariables
}): Promise<{
  data: CreateSubscriptionCheckoutData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CREATE_SUBSCRIPTION_CHECKOUT, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
