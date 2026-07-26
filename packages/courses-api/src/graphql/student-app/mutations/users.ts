import { apiClient } from "@academy/courses-api/api-client"
import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

// Returns `UserProfile` (not `User`) — a narrower type: no isActive/timestamps,
// and the identifier is `id`. The route revalidates via GetProfile afterwards.
export const UPDATE_USER_PROFILE = graphql(`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      fullName
      userName
      email
      phoneNumber
      profilePicture
      major
      occupation
      interests
    }
  }
`)

export type UpdateUserProfileData = ResultOf<typeof UPDATE_USER_PROFILE>
export type UpdateUserProfileVariables = VariablesOf<typeof UPDATE_USER_PROFILE>

export async function updateUserProfile({
  request,
  variables,
}: {
  request: Request
  variables: UpdateUserProfileVariables
}): Promise<{
  data: UpdateUserProfileData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(UPDATE_USER_PROFILE, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
