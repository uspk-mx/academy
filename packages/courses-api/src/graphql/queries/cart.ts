import { apiClient, coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"
import { getCookie, getToken } from "@academy/courses-api/utils"

export const CART_QUERY = graphql(`
  query Cart {
    cart {
      id
      userId
      items {
        id
        inStock
        itemId
        itemType
        notes
        quantity
        unitPrice
        cartId
        item {
          __typename
          ... on Course {
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
            id
            title
            price
            subtotalRegularPrice
            featuredImage
            discountValue
            discountType
          }
          ... on SubscriptionPlan {
            id
            planName
            price
            duration
            stripePricePlanID
          }
        }
      }
      subtotal
      tax
      total
      expiresAt
      createdAt
      updatedAt
    }
  }
`)

export type CartData = ResultOf<typeof CART_QUERY>

export async function getCart(request: Request): Promise<CartData> {
  const token = await getToken(request)
  const guestCart = await getCookie(request, "guest_cart")

  let setCookies: string[] = []
  const result = await apiClient(
    token,
    (cookies) => {
      setCookies = cookies
    }, // however apiClient forwards extra headers — send the cookie back to the API:
    guestCart ? { Cookie: `guest_cart=${guestCart}` } : {}
  )
    .query(CART_QUERY, {})
    .toPromise()

  // Runs in a layout loader on every page, so it must never throw: an empty or
  // absent cart (a guest who hasn't added anything, or a cleared cart) is a
  // normal state. Surface real backend errors in the logs, but still return an
  // empty cart so the page keeps rendering. Callers already handle `cart: null`.
  if (result.error) {
    console.error("getCart:", result.error.message)
    return { cart: null }
  }
  return result.data ?? { cart: null }
}
