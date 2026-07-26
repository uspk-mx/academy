import { getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../../graphql"
import { apiClient } from "@academy/courses-api/api-client"

export const MARK_LESSON_COMPLETED = graphql(`
  mutation MarkLessonCompleted($input: MarkLessonCompletedInput!) {
    markLessonCompleted(input: $input) {
      id
      completed
      startedAt
      completedAt
      updatedAt
      user {
        id
        fullName
        email
      }
      lesson {
        id
        title
      }
    }
  }
`)

export type MarkLessonCompletedData = ResultOf<typeof MARK_LESSON_COMPLETED>
export type MarkLessonCompletedVariables = VariablesOf<
  typeof MARK_LESSON_COMPLETED
>

export async function markLessonCompleted({
  request,
  variables,
}: {
  request: Request
  variables: MarkLessonCompletedVariables
}): Promise<{
  data: MarkLessonCompletedData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(MARK_LESSON_COMPLETED, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export const REVERT_LESSON_PROGRESS = graphql(`
  mutation RevertLessonProgress($lessonId: ID!) {
    revertLessonProgress(lessonId: $lessonId)
  }
`)

export type RevertLessonProgressData = ResultOf<typeof REVERT_LESSON_PROGRESS>
export type RevertLessonProgressVariables = VariablesOf<
  typeof REVERT_LESSON_PROGRESS
>

export async function revertLessonProgress({
  request,
  variables,
}: {
  request: Request
  variables: RevertLessonProgressVariables
}): Promise<{
  data: RevertLessonProgressData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(REVERT_LESSON_PROGRESS, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

// submitQuizAttempt moved to ./quiz — it now sends answers and grades on the
// server, returning a QuizAttemptResult rather than a QuizProgress.

export const GET_COURSE_PROGRESS = graphql(`
  query GetCourseProgress($userId: ID!, $courseId: ID!) {
    getCourseProgress(userId: $userId, courseId: $courseId) {
      id
      completedLessons
      completedQuizzes
      totalLessons
      totalQuizzes
      totalAssignments
      progressPercentage
      startedAt
      completed
      completedAt
      averageCompletionTime
      averageScore
      createdAt
      updatedAt
      user {
        id
        fullName
        email
      }
      course {
        id
        title
      }
    }
  }
`)

export type GetCourseProgressData = ResultOf<typeof GET_COURSE_PROGRESS>
export type GetCourseProgressVariables = VariablesOf<typeof GET_COURSE_PROGRESS>

export async function getCourseProgress({
  request,
  variables,
}: {
  request: Request
  variables: GetCourseProgressVariables
}): Promise<{
  data: GetCourseProgressData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(GET_COURSE_PROGRESS, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export const START_COURSE_POGRESS = graphql(`
  mutation StartCourseProgress($input: StartCourseProgressInput!) {
    startCourseProgress(input: $input) {
      id
      user {
        id
        fullName
        email
        userName
      }
      course {
        id
        title
        category {
          id
          name
        }
        level {
          id
          name
        }
      }
      completedLessons
      completedQuizzes
      totalLessons
      totalQuizzes
      totalAssignments
      progressPercentage
      startedAt
      completed
      completedAt
      averageCompletionTime
      averageScore
      createdAt
      updatedAt
    }
  }
`)

export type StartCourseProgressData = ResultOf<typeof START_COURSE_POGRESS>
export type StartCourseProgressVariables = VariablesOf<
  typeof START_COURSE_POGRESS
>

export async function startCourseProgress({
  request,
  variables,
}: {
  request: Request
  variables: StartCourseProgressVariables
}): Promise<{
  data: StartCourseProgressData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(START_COURSE_POGRESS, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export const UPDATE_QUIZ_PROGRESS = graphql(`
  mutation UpdateQuizProgress($input: QuizProgressInput!) {
    updateQuizProgress(input: $input) {
      id
      user {
        id
        fullName
        email
        isActive
        userName
        profilePicture
        phoneNumber
        occupation
      }
      quiz {
        id
        title
        timer
        timeUnit
        position
        passingGrade
        maxAttempts
        content
        createdAt
        updatedAt
      }
      score
      completed
      startedAt
      completedAt
    }
  }
`)

export type UpdateQuizProgressData = ResultOf<typeof UPDATE_QUIZ_PROGRESS>
export type UpdateQuizProgressVariables = VariablesOf<
  typeof UPDATE_QUIZ_PROGRESS
>

export async function updateQuizProgress({
  request,
  variables,
}: {
  request: Request
  variables: UpdateQuizProgressVariables
}): Promise<{
  data: UpdateQuizProgressData | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(UPDATE_QUIZ_PROGRESS, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}
