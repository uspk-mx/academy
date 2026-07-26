import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../graphql"
import { apiClient } from "@academy/courses-api/api-client"

export const CREATE_ENROLLMENT = graphql(`
  mutation CreateEnrollment($userId: ID!, $courseId: ID!) {
    createEnrollment(userId: $userId, courseId: $courseId) {
      id
      user {
        id
        fullName
        userName
        email
        role
      }
      status
      enrolledAt
      course {
        id
        title
        shortDescription
        featuredImage
        slug
      }
    }
  }
`)

export type CreateEnrollmentResult = ResultOf<typeof CREATE_ENROLLMENT>
export type CreateEnrollmentVariables = VariablesOf<typeof CREATE_ENROLLMENT>

export async function createEnrollmentMutation({
  request,
  variables,
}: {
  request: Request
  variables: CreateEnrollmentVariables
}): Promise<{
  data: CreateEnrollmentResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CREATE_ENROLLMENT, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
