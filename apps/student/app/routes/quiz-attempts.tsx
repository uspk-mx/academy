import { getMyQuizAttempts } from "@academy/courses-api/graphql/student-app/queries/quiz-attempts"
import { StudentQuizAttemptsPage } from "@academy/student-ui/components/pages/quiz-attempts-page"
import {
  quizAttemptsPageLabels,
  type StudentQuizAttempt,
} from "@academy/student-ui/types/quiz-attempts"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { pickLocale } from "@academy/user-ui/lib/lang"
import { useParams } from "react-router"
import type { Route } from "./+types/quiz-attempts"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Intentos de quizzes" },
    {
      name: "description",
      content:
        "Intentos de quizzes de Uspk Academy, revisa tus resultados por curso.",
    },
  ]
}

/**
 * `myQuizAttempts` is the append-only history, newest first. The API stores
 * `score` as EARNED MARKS, so the percentage is derived here against the sum of
 * the quiz's question marks and compared with `passingGrade`.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await getMyQuizAttempts(request)
  const rows = result?.myQuizAttempts ?? []

  // Attempt numbers count from the oldest attempt of each quiz. The list
  // arrives newest-first, so walk it backwards.
  const attemptNumbers = new Map<string, number>()
  const numberByAttemptId = new Map<string, number>()
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const quizId = rows[index]?.quiz?.id
    if (!quizId) continue
    const next = (attemptNumbers.get(quizId) ?? 0) + 1
    attemptNumbers.set(quizId, next)
    numberByAttemptId.set(rows[index].id, next)
  }

  const items: StudentQuizAttempt[] = rows.flatMap((attempt) => {
    const quiz = attempt.quiz
    const course = quiz?.topic?.course
    if (!quiz || !course) return []

    const questions = quiz.questions ?? []
    const totalMarks = questions.reduce(
      (sum, question) => sum + (question?.mark ?? 0),
      0
    )
    const earnedMarks = attempt.score ?? 0
    // A quiz with no questions has nothing to score against; 0% beats NaN.
    const percentage =
      totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0
    const passingGrade = quiz.passingGrade ?? 0

    return [
      {
        id: attempt.id,
        quizTitle: quiz.title,
        courseId: course.id,
        courseTitle: course.title,
        attemptedAt: attempt.attemptDate ?? "",
        earnedMarks,
        totalMarks,
        percentage,
        passingGrade,
        passed: percentage >= passingGrade,
        questionCount: questions.length,
        attemptNumber: numberByAttemptId.get(attempt.id) ?? 1,
        maxAttempts: quiz.maxAttempts ?? null,
      },
    ]
  })

  return {
    items,
    labels: pickLocale(params.lang, quizAttemptsPageLabels),
  }
}

export default function QuizAttempts({ loaderData }: Route.ComponentProps) {
  const { items, labels } = loaderData
  const { lang } = useParams()

  return (
    <StudentQuizAttemptsPage
      items={items}
      labels={labels}
      coursesHref={`/${lang}/dashboard/courses`}
    />
  )
}
