import { apiClient } from "@academy/courses-api/api-client"
import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

/**
 * Submits a student's answers. The client sends WHAT was chosen, never a score;
 * the server grades against the authoritative keys and returns the result,
 * including the answer explanations (only now, after submitting) and the
 * per-question outcome.
 */
export const SUBMIT_QUIZ_ATTEMPT = graphql(`
  mutation SubmitQuizAttempt($input: SubmitQuizAttemptInput!) {
    submitQuizAttempt(input: $input) {
      attemptId
      earnedMarks
      possibleMarks
      percentage
      passed
      passingGrade
      correctCount
      gradedCount
      excludedCount
      attemptsUsed
      attemptsLeft
      questionResults {
        questionId
        correct
        excluded
        markEarned
        markPossible
        answerExplanation
      }
    }
  }
`)

export type SubmitQuizAttemptData = ResultOf<typeof SUBMIT_QUIZ_ATTEMPT>
export type SubmitQuizAttemptVariables = VariablesOf<typeof SUBMIT_QUIZ_ATTEMPT>

export async function submitQuizAttempt({
  request,
  variables,
}: {
  request: Request
  variables: SubmitQuizAttemptVariables
}): Promise<{ data: SubmitQuizAttemptData | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(SUBMIT_QUIZ_ATTEMPT, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
