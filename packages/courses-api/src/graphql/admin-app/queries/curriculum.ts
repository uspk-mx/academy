import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

/** A quiz plus its full question/answer tree — the question editor's payload. */
export const ADMIN_QUIZ_QUERY = graphql(`
  query AdminQuiz($quizId: ID!) {
    quiz(id: $quizId) {
      id
      title
      content
      timer
      timeUnit
      position
      maxAttempts
      passingGrade
      questions {
        id
        title
        description
        media
        type
        mark
        order
        answerExplanation
        settings {
          questionMark
          questionType
          answerRequired
          showQuestionMark
          randomizeQuestion
          sortableItems
          correctAnswers
          matrixMatches {
            columnA
            columnB
          }
        }
        answers {
          id
          type
          title
          isCorrect
          image
          gapMatch
          viewFormat
          settings
          order
          correctAnswers
        }
      }
    }
  }
`)

export const ADMIN_PRACTICE_BITES_QUERY = graphql(`
  query AdminPracticeBites($lessonId: ID!) {
    practiceBitesByLessonId(lessonId: $lessonId) {
      id
      title
      description
      position
      solutionRevealThreshold
      items {
        id
        type
        prompt
        media
        answerExplanation
        position
        settings {
          matchingRows {
            columns
          }
          correctBoolean
          acceptedAnswers
          caseSensitive
          options
          blanks
        }
      }
    }
  }
`)

export type AdminQuizData = ResultOf<typeof ADMIN_QUIZ_QUERY>
export type AdminQuizDetail = AdminQuizData["quiz"]
export type AdminQuestion = NonNullable<AdminQuizDetail["questions"]>[number]
export type AdminAnswer = NonNullable<AdminQuestion["answers"]>[number]

export type AdminPracticeBitesData = ResultOf<
  typeof ADMIN_PRACTICE_BITES_QUERY
>
export type AdminPracticeBite =
  AdminPracticeBitesData["practiceBitesByLessonId"][number]
export type AdminPracticeBiteItem = NonNullable<
  AdminPracticeBite["items"]
>[number]

export function getAdminQuiz(request: Request, quizId: string) {
  return runQuery(request, ADMIN_QUIZ_QUERY, { quizId })
}

export function getAdminPracticeBites(request: Request, lessonId: string) {
  return runQuery(request, ADMIN_PRACTICE_BITES_QUERY, { lessonId })
}
