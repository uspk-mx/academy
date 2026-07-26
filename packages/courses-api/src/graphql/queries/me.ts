import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../graphql"

export const ME_QUERY = graphql(`
  query Me {
    me {
      customerId
      fullName
      email
      profilePicture
      role
      company {
        id
        name
        logo
        icon
      }
      courses {
        id
        progress {
          completed
        }
      }
    }
  }
`)

export type MeData = ResultOf<typeof ME_QUERY>

/**
 * Resolves the current user from the session cookie. The `me` resolver errors
 * for anonymous requests, so a failure here means "not logged in" rather than a
 * hard error — callers get `null` and render the anonymous state.
 */
export async function getMe(request: Request): Promise<MeData | null> {
  try {
    return await coursesApiClient(request, ME_QUERY, {})
  } catch {
    return null
  }
}
