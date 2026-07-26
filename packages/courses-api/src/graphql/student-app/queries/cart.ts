import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * Slim cart read for the header popover — just what a line needs to render
 * (title, image, quantity, price) plus the total. The full cart (enrollments,
 * reviews, discounts…) lives in the web app's checkout query; the student app
 * only previews the cart and links out to that page to finish the purchase.
 *
 * The cart is server-side per user, so the same cart shows here and in the web
 * app. Students are always authenticated, so the token identifies the cart (no
 * guest-cart cookie needed).
 */
export const MY_CART_QUERY = graphql(`
  query MyCart {
    cart {
      id
      total
      items {
        id
        quantity
        unitPrice
        item {
          __typename
          ... on Course {
            id
            title
            featuredImage
          }
          ... on CourseBundle {
            id
            title
            featuredImage
          }
          ... on SubscriptionPlan {
            id
            planName
          }
        }
      }
    }
  }
`)

export type MyCartResult = ResultOf<typeof MY_CART_QUERY>

export async function getMyCart(request: Request): Promise<MyCartResult | null> {
  try {
    return await coursesApiClient(request, MY_CART_QUERY, {})
  } catch {
    return null
  }
}
