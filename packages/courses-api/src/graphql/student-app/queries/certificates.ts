import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * The logged-in user's certificates. Session-scoped: the server issues one for
 * each completed course that lacks it (dated at completion) and returns them
 * all, so completed courses always have a certificate to show.
 */
export const MY_CERTIFICATES_QUERY = graphql(`
  query MyCertificates {
    myCertificates {
      id
      issuedAt
      user {
        id
        fullName
      }
      course {
        id
        title
      }
      template {
        id
        name
      }
    }
  }
`)

export type MyCertificatesResult = ResultOf<typeof MY_CERTIFICATES_QUERY>

export async function getMyCertificates(
  request: Request
): Promise<MyCertificatesResult | null> {
  try {
    return await coursesApiClient(request, MY_CERTIFICATES_QUERY, {})
  } catch {
    return null
  }
}
