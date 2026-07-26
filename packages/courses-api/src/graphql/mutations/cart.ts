import { apiClient } from "@academy/courses-api/api-client"
import { getCookie, getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const ADD_TO_CART_MUTATION = graphql(`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      total
      expiresAt
      createdAt
      subtotal
      items {
        item {
          ... on Course {
            __typename
            id
            title
            price
            featuredImage
            enrollments {
              id
              status
              user {
                id
                fullName
                email
              }
            }
            tags
            status
            slug
            shortDescription
            reviews {
              id
              likes
              rating
              comment
            }
            discountedPrice
            category {
              id
              name
            }
            level {
              id
              name
            }
            pricingType
          }
          ... on CourseBundle {
            __typename
            id
            title
            price
            subtotalRegularPrice
            featuredImage
            discountValue
            discountType
          }
          ... on SubscriptionPlan {
            __typename
            id
            planName
            price
            duration
            stripePricePlanID
          }
        }
        inStock
        id
        unitPrice
        quantity
        notes
        itemType
        itemId
        cartId
      }
    }
  }
`)

export type AddToCartResult = ResultOf<typeof ADD_TO_CART_MUTATION>
export type AddToCartVariables = VariablesOf<typeof ADD_TO_CART_MUTATION>

export async function addToCartMutation({
  request,
  variables,
}: {
  request: Request
  variables: AddToCartVariables
}): Promise<AddToCartResult & { setCookies: string[] }> {
  const token = await getToken(request)
  const guestCart = await getCookie(request, "guest_cart")

  let setCookies: string[] = []
  const mutation = await apiClient(
    token,
    (cookies) => {
      setCookies = cookies
    }, // however apiClient forwards extra headers — send the cookie back to the API:
    guestCart ? { Cookie: `guest_cart=${guestCart}` } : {}
  )
    .mutation(ADD_TO_CART_MUTATION, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { addToCart: mutation.data!.addToCart, setCookies } // keep forwarding Set-Cookie on the response too
}

const REMOVE_CART = graphql(`
  mutation RemoveFromCart($itemId: ID!) {
    removeFromCart(itemId: $itemId) {
      id
      tax
      subtotal
      total
      expiresAt
      items {
        id
        quantity
        unitPrice
        itemType
        itemId
        notes
      }
    }
  }
`)

export type RemoveCartResult = ResultOf<typeof REMOVE_CART>
export type RemoveCartVariables = VariablesOf<typeof REMOVE_CART>

export async function removeCartMutation({
  request,
  variables,
}: {
  request: Request
  variables: RemoveCartVariables
}) {
  const token = await getToken(request)
  const guestCart = await getCookie(request, "guest_cart")

  let setCookies: string[] = []
  const mutation = await apiClient(
    token,
    (cookies) => {
      setCookies = cookies
    }, // however apiClient forwards extra headers — send the cookie back to the API:
    guestCart ? { Cookie: `guest_cart=${guestCart}` } : {}
  )
    .mutation(REMOVE_CART, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies } // keep forwarding Set-Cookie on the response too
}
