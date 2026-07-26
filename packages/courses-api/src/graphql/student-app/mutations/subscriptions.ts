import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"
import { apiClient } from "@academy/courses-api/api-client"

/**
 * Cancels the user's subscription at period end (Stripe stops renewing; access
 * lasts until the paid period ends). The resolver scopes to the authenticated
 * user, so a user can only cancel their own subscription.
 */
export const CANCEL_USER_SUBSCRIPTION = graphql(`
  mutation CancelUserSubscription($subscriptionId: ID!) {
    cancelUserSubscription(subscriptionId: $subscriptionId)
  }
`)

export type CancelUserSubscriptionData = ResultOf<
  typeof CANCEL_USER_SUBSCRIPTION
>
export type CancelUserSubscriptionVariables = VariablesOf<
  typeof CANCEL_USER_SUBSCRIPTION
>

export async function cancelUserSubscription({
  request,
  variables,
}: {
  request: Request
  variables: CancelUserSubscriptionVariables
}): Promise<{
  data: CancelUserSubscriptionData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CANCEL_USER_SUBSCRIPTION, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
