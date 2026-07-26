import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * Loads a quiz for a student to take. It carries questions and options only —
 * never a correct answer. For SORTING and MATRIX_SORTING the server has already
 * shuffled/split the items so the correct order and pairing don't reach the
 * client; grading happens on the server from the authoritative keys.
 */
export const QUIZ_FOR_ATTEMPT_QUERY = graphql(`
  query QuizForAttempt($quizId: ID!) {
    quizForAttempt(quizId: $quizId) {
      id
      title
      description
      timer
      timeUnit
      passingGrade
      maxAttempts
      attemptsUsed
      attemptsLeft
      questions {
        id
        title
        description
        media
        type
        mark
        options
        sortItems
        matrixLeft
        matrixRight
        blankCount
      }
    }
  }
`)

export type QuizForAttemptResult = ResultOf<typeof QUIZ_FOR_ATTEMPT_QUERY>

export async function getQuizForAttempt(
  request: Request,
  quizId: string
): Promise<QuizForAttemptResult | null> {
  try {
    return await coursesApiClient(request, QUIZ_FOR_ATTEMPT_QUERY, { quizId })
  } catch {
    return null
  }
}
