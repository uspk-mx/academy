import { apiClient } from "@academy/courses-api/api-client"
import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

/**
 * Submits a learner's practice-bite answers. The server grades against the
 * hidden solution and returns per-item feedback; the solution itself only comes
 * back once enough attempts have unlocked it (`solutionRevealed`).
 */
export const SUBMIT_PRACTICE_BITE = graphql(`
  mutation SubmitPracticeBite($input: SubmitPracticeBiteInput!) {
    submitPracticeBite(input: $input) {
      practiceBiteId
      completed
      score
      correctCount
      totalCount
      attempts
      isPerfect
      isFirstAttempt
      message
      itemResults {
        itemId
        correct
        feedback
        answerExplanation
        solutionRevealed
        solution {
          correctBoolean
          acceptedAnswers
          blanks
          matchingRows {
            columns
          }
        }
      }
    }
  }
`)

export type SubmitPracticeBiteData = ResultOf<typeof SUBMIT_PRACTICE_BITE>
export type SubmitPracticeBiteVariables = VariablesOf<
  typeof SUBMIT_PRACTICE_BITE
>

export async function submitPracticeBite({
  request,
  variables,
}: {
  request: Request
  variables: SubmitPracticeBiteVariables
}): Promise<{
  data: SubmitPracticeBiteData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(SUBMIT_PRACTICE_BITE, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
