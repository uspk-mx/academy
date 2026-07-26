import { apiClient } from "@academy/courses-api/api-client"
import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

/**
 * Review CRUD. The API scopes update/delete to the caller inside the SQL, so a
 * review that belongs to someone else comes back as "not found" — there is no
 * ownership check to duplicate here.
 *
 * The selection sets stay small: the route revalidates through GetProfile after
 * every mutation, so the page re-renders from the profile payload rather than
 * from these results.
 */

const REVIEW_FIELDS = `
  id
  rating
  comment
  likes
  createdAt
  updatedAt
`

export const CREATE_REVIEW = graphql(`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      ${REVIEW_FIELDS}
      course {
        id
        title
      }
    }
  }
`)

export const UPDATE_REVIEW = graphql(`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput) {
    updateReview(id: $id, input: $input) {
      ${REVIEW_FIELDS}
    }
  }
`)

export const DELETE_REVIEW = graphql(`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`)

export type CreateReviewData = ResultOf<typeof CREATE_REVIEW>
export type CreateReviewVariables = VariablesOf<typeof CREATE_REVIEW>
export type UpdateReviewData = ResultOf<typeof UPDATE_REVIEW>
export type UpdateReviewVariables = VariablesOf<typeof UPDATE_REVIEW>
export type DeleteReviewData = ResultOf<typeof DELETE_REVIEW>
export type DeleteReviewVariables = VariablesOf<typeof DELETE_REVIEW>

export async function createReview({
  request,
  variables,
}: {
  request: Request
  variables: CreateReviewVariables
}): Promise<{ data: CreateReviewData | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CREATE_REVIEW, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export async function updateReview({
  request,
  variables,
}: {
  request: Request
  variables: UpdateReviewVariables
}): Promise<{ data: UpdateReviewData | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(UPDATE_REVIEW, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export async function deleteReview({
  request,
  variables,
}: {
  request: Request
  variables: DeleteReviewVariables
}): Promise<{ data: DeleteReviewData | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(DELETE_REVIEW, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
