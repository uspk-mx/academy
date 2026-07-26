import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/**
 * The practice bites attached to a lesson, learner-safe: `settings` has the
 * correct answers stripped and matching columns independently shuffled, and
 * `solution` is deliberately NOT selected (the server returns it null for
 * learners anyway, and the solution only surfaces per-item after submitting,
 * once enough attempts unlock it).
 */
export const PRACTICE_BITES_BY_LESSON_QUERY = graphql(`
  query PracticeBitesByLessonId($lessonId: ID!) {
    practiceBitesByLessonId(lessonId: $lessonId) {
      id
      title
      description
      solutionRevealThreshold
      progress {
        attempts
        completed
        lastScore
      }
      items {
        id
        type
        prompt
        media
        position
        settings {
          options
          matchingColumns {
            items
          }
        }
      }
    }
  }
`)

export type PracticeBitesByLessonResult = ResultOf<
  typeof PRACTICE_BITES_BY_LESSON_QUERY
>

export async function getPracticeBitesByLesson(
  request: Request,
  lessonId: string
): Promise<PracticeBitesByLessonResult | null> {
  try {
    return await coursesApiClient(request, PRACTICE_BITES_BY_LESSON_QUERY, {
      lessonId,
    })
  } catch {
    return null
  }
}
