import { submitQuizAttempt } from "@academy/courses-api/graphql/student-app/mutations/quiz"
import { getStudentCourse } from "@academy/courses-api/graphql/student-app/queries/courses"
import { getQuizForAttempt } from "@academy/courses-api/graphql/student-app/queries/quiz"
import { StudentQuizPage } from "@academy/student-ui/components/pages/quiz-page"
import {
  courseViewerLabels,
  type CourseViewerLabels,
} from "@academy/student-ui/types/course-viewer"
import {
  quizPageLabels,
  type QuizPageLabels,
  type QuizQuestionType,
  type QuizResultView,
  type QuizView,
} from "@academy/student-ui/types/quiz"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { pickLocale } from "@academy/user-ui/lib/lang"
import { useState } from "react"
import {
  data,
  redirect,
  useFetcher,
  useParams,
  useRevalidator,
} from "react-router"
import { hasCourseCertificate } from "~/../lib/certificate"
import { buildCourseOutline } from "~/../lib/course-outline"
import { sanitizeLessonHtml } from "~/../lib/lesson-html"
import type { Route } from "./+types/quiz"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.quiz?.title
  return [
    { title: title ? `Uspk Academy | ${title}` : "Uspk Academy | Quiz" },
    { name: "description", content: "Quiz del curso." },
  ]
}

const QUESTION_TYPES: QuizQuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_IN_THE_BLANKS",
  "SORTING",
  "MATRIX_SORTING",
]

function toType(value: string): QuizQuestionType {
  return QUESTION_TYPES.includes(value as QuizQuestionType)
    ? (value as QuizQuestionType)
    : "SINGLE_CHOICE"
}

/** timer + timeUnit -> seconds. Minutes is the common unit; seconds/hours too. */
function toSeconds(timer: number | null, unit: string | null): number | null {
  if (!timer || timer <= 0) return null
  switch ((unit ?? "minutes").toLowerCase()) {
    case "seconds":
    case "second":
      return timer
    case "hours":
    case "hour":
      return timer * 3600
    default:
      return timer * 60
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  // The quiz lives inside the course viewer, so load the course for the sidebar
  // outline alongside the quiz itself.
  const [result, courseResult, hasCertificate] = await Promise.all([
    getQuizForAttempt(request, params.quizId),
    getStudentCourse({ request, variables: { courseId: params.cid } }),
    hasCourseCertificate(request, params.cid),
  ])
  const raw = result?.quizForAttempt
  if (!raw) throw new Response("Not Found", { status: 404 })

  const course = courseResult?.course
  if (!course) throw new Response("Not Found", { status: 404 })

  // Entitlement guard (defense in depth): non-entitled students can't sit in
  // the quiz viewer — bounce them to their course list.
  if (!course.hasAccess) throw redirect(`/${params.lang}/dashboard/courses`)

  const outline = buildCourseOutline(course, params.lang)

  const quiz: QuizView = {
    id: raw.id,
    title: raw.title,
    // Descriptions are instructor HTML — sanitized here so the browser never
    // sees raw markup, exactly as lesson bodies are.
    description: raw.description ? sanitizeLessonHtml(raw.description) : null,
    durationSeconds: toSeconds(raw.timer ?? null, raw.timeUnit ?? null),
    passingGrade: raw.passingGrade,
    attemptsUsed: raw.attemptsUsed,
    attemptsLeft: raw.attemptsLeft ?? null,
    questions: (raw.questions ?? []).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description ? sanitizeLessonHtml(q.description) : null,
      media: q.media || null,
      type: toType(q.type),
      mark: q.mark ?? 0,
      options: (q.options ?? []).filter((v): v is string => v != null),
      sortItems: (q.sortItems ?? []).filter((v): v is string => v != null),
      matrixLeft: (q.matrixLeft ?? []).filter((v): v is string => v != null),
      matrixRight: (q.matrixRight ?? []).filter((v): v is string => v != null),
      blankCount: q.blankCount ?? 0,
    })),
  }

  // The viewer only announces the certificate; the certificates page owns the
  // PDF. Gated on the credential's existence (the authoritative completion
  // signal) rather than the course.progress field, which comes back null here.
  const certificateHref = hasCertificate
    ? `/${params.lang}/dashboard/certificates?course=${params.cid}`
    : null

  return {
    quiz,
    outline,
    certificateHref,
    labels: pickLocale(params.lang, quizPageLabels),
    viewerLabels: pickLocale(params.lang, courseViewerLabels),
  }
}

/**
 * Grades a submission. The client posts the answers as JSON; the server mutation
 * scores them against the authoritative keys and returns the outcome. No score
 * is trusted from the client.
 */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const rawAnswers = String(form.get("payload") ?? "")

  let payload: {
    quizId: string
    answers: {
      questionId: string
      selected?: string[]
      pairs?: { left: string; right: string }[]
    }[]
  }
  try {
    payload = JSON.parse(rawAnswers)
  } catch {
    return data({ error: "invalidPayload" as const }, { status: 400 })
  }

  try {
    const { data: result, setCookies } = await submitQuizAttempt({
      request,
      variables: {
        input: {
          quizId: payload.quizId,
          answers: payload.answers.map((a) => ({
            questionId: a.questionId,
            selected: a.selected ?? [],
            pairs: a.pairs ?? [],
          })),
        },
      },
    })

    const attempt = result?.submitQuizAttempt
    if (!attempt) return data({ error: "generic" as const }, { status: 500 })

    const view: QuizResultView = {
      attemptId: attempt.attemptId,
      earnedMarks: attempt.earnedMarks,
      possibleMarks: attempt.possibleMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passingGrade: attempt.passingGrade,
      correctCount: attempt.correctCount,
      gradedCount: attempt.gradedCount,
      excludedCount: attempt.excludedCount,
      attemptsUsed: attempt.attemptsUsed,
      attemptsLeft: attempt.attemptsLeft ?? null,
      questionResults: (attempt.questionResults ?? []).map((qr) => ({
        questionId: qr.questionId,
        correct: qr.correct,
        excluded: qr.excluded,
        markEarned: qr.markEarned,
        markPossible: qr.markPossible,
        answerExplanation: qr.answerExplanation ?? null,
      })),
    }

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return data({ result: view }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("no attempts left")) {
      return data({ error: "noAttempts" as const }, { status: 409 })
    }
    console.error("[quiz] submit failed:", error)
    return data({ error: "generic" as const }, { status: 500 })
  }
}

export default function Quiz({ loaderData }: Route.ComponentProps) {
  const { quiz, outline, certificateHref, labels, viewerLabels } = loaderData
  const { lang } = useParams()
  const revalidator = useRevalidator()
  // Bumping this remounts the runner with a fresh fetcher, so the previous
  // result and all draft state are cleared for a new attempt.
  const [attemptKey, setAttemptKey] = useState(0)

  return (
    <QuizRunner
      key={attemptKey}
      quiz={quiz}
      outline={outline}
      certificateHref={certificateHref}
      labels={labels}
      viewerLabels={viewerLabels}
      coursesHref={`/${lang}/dashboard/courses`}
      onRetry={() => {
        revalidator.revalidate()
        setAttemptKey((k) => k + 1)
      }}
    />
  )
}

function QuizRunner({
  quiz,
  outline,
  certificateHref,
  labels,
  viewerLabels,
  coursesHref,
  onRetry,
}: {
  quiz: QuizView
  outline: React.ComponentProps<typeof StudentQuizPage>["outline"]
  certificateHref: React.ComponentProps<
    typeof StudentQuizPage
  >["certificateHref"]
  labels: QuizPageLabels
  viewerLabels: CourseViewerLabels
  coursesHref: string
  onRetry: () => void
}) {
  const fetcher = useFetcher<typeof action>()

  const result =
    fetcher.data && "result" in fetcher.data ? fetcher.data.result : null

  return (
    <StudentQuizPage
      quiz={quiz}
      outline={outline}
      certificateHref={certificateHref}
      labels={labels}
      viewerLabels={viewerLabels}
      coursesHref={coursesHref}
      backToCourseHref={coursesHref}
      result={result}
      isSubmitting={fetcher.state !== "idle"}
      onSubmit={(payload) =>
        fetcher.submit({ payload: JSON.stringify(payload) }, { method: "post" })
      }
      onRetry={onRetry}
    />
  )
}
