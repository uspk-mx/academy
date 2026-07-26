import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../graphql"
import { apiClient } from "@academy/courses-api/api-client"

export const CHECKOUT_MUTATION = graphql(`
  mutation Checkout($cartId: ID!) {
    checkout(cartId: $cartId) {
      id
      url
      clientSecret
    }
  }
`)

export type CheckoutMutationResult = ResultOf<typeof CHECKOUT_MUTATION>
export type CheckoutMutationVariables = VariablesOf<typeof CHECKOUT_MUTATION>

export async function checkoutMutation({
  request,
  variables,
}: {
  request: Request
  variables: CheckoutMutationVariables
}): Promise<{
  data: CheckoutMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CHECKOUT_MUTATION, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

