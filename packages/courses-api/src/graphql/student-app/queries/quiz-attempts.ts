import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * The caller's full attempt history, newest first.
 *
 * `score` is EARNED MARKS, not a percentage — the quiz player sums each
 * question's `mark`. The question marks come along so the route can turn that
 * into a percentage and compare it against `passingGrade`.
 */
export const MY_QUIZ_ATTEMPTS_QUERY = graphql(`
  query MyQuizAttempts {
    myQuizAttempts {
      id
      score
      attemptDate
      quiz {
        id
        title
        passingGrade
        maxAttempts
        questions {
          id
          mark
        }
        topic {
          id
          course {
            id
            title
            featuredImage
          }
        }
      }
    }
  }
`)

export type MyQuizAttemptsResult = ResultOf<typeof MY_QUIZ_ATTEMPTS_QUERY>

export async function getMyQuizAttempts(
  request: Request
): Promise<MyQuizAttemptsResult | null> {
  try {
    return await coursesApiClient(request, MY_QUIZ_ATTEMPTS_QUERY, {})
  } catch {
    return null
  }
}
