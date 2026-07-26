import { submitPracticeBite } from "@academy/courses-api/graphql/student-app/mutations/practice-bites"
import type { PracticeBiteResultView } from "@academy/student-ui/types/practice-bites"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { data } from "react-router"
import type { Route } from "./+types/practice-bite"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

/**
 * Resource route: grades a practice-bite submission. It's separate from the
 * lesson route so the lesson's own action (completion toggle) stays single-
 * purpose; the practice-bite widget posts here with a fetcher.
 *
 * The client sends answers, never a score — the server grades against the
 * hidden solution and returns per-item feedback.
 */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()

  let payload: {
    practiceBiteId: string
    answers: {
      itemId: string
      booleanAnswer?: boolean
      textAnswer?: string
      selectedOptions?: string[]
      matchingRows?: { columns: string[] }[]
    }[]
  }
  try {
    payload = JSON.parse(String(form.get("payload") ?? ""))
  } catch {
    return data({ error: "invalidPayload" as const }, { status: 400 })
  }

  try {
    const { data: result, setCookies } = await submitPracticeBite({
      request,
      variables: {
        input: {
          practiceBiteId: payload.practiceBiteId,
          answers: payload.answers.map((a) => ({
            itemId: a.itemId,
            ...(a.booleanAnswer != null ? { booleanAnswer: a.booleanAnswer } : {}),
            ...(a.textAnswer != null ? { textAnswer: a.textAnswer } : {}),
            ...(a.selectedOptions ? { selectedOptions: a.selectedOptions } : {}),
            ...(a.matchingRows ? { matchingRows: a.matchingRows } : {}),
          })),
        },
      },
    })

    const submission = result?.submitPracticeBite
    if (!submission) return data({ error: "generic" as const }, { status: 500 })

    const view: PracticeBiteResultView = {
      practiceBiteId: submission.practiceBiteId,
      completed: submission.completed,
      score: submission.score,
      correctCount: submission.correctCount,
      totalCount: submission.totalCount,
      attempts: submission.attempts,
      isPerfect: submission.isPerfect,
      message: submission.message,
      itemResults: (submission.itemResults ?? []).map((r) => ({
        itemId: r.itemId,
        correct: r.correct,
        feedback: r.feedback,
        answerExplanation: r.answerExplanation ?? null,
        solutionRevealed: r.solutionRevealed,
        solution: r.solution
          ? {
              correctBoolean: r.solution.correctBoolean ?? null,
              acceptedAnswers: (r.solution.acceptedAnswers ?? []).filter(
                (v): v is string => v != null
              ),
              blanks: (r.solution.blanks ?? []).filter(
                (v): v is string => v != null
              ),
              matchingRows: (r.solution.matchingRows ?? []).map((row) =>
                (row.columns ?? []).filter((v): v is string => v != null)
              ),
            }
          : null,
      })),
    }

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return data({ result: view }, { headers })
  } catch (error) {
    console.error("[practice-bite] submit failed:", error)
    return data({ error: "generic" as const }, { status: 500 })
  }
}
