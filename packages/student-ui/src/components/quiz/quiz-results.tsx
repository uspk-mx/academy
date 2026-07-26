import { cn } from "@academy/user-ui/lib/utils"
import {
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react"
import { Link } from "react-router"
import type {
  QuizPageLabels,
  QuizQuestionView,
  QuizResultView,
} from "../../types/quiz"

export interface QuizResultsProps {
  result: QuizResultView
  /** Questions in order, to title each review row. */
  questions: QuizQuestionView[]
  labels: QuizPageLabels
  backToCourseHref: string
  /** Re-take, when attempts remain. */
  onRetry?: () => void
}

export function QuizResults({
  result,
  questions,
  labels,
  backToCourseHref,
  onRetry,
}: QuizResultsProps) {
  const titleById = new Map(questions.map((q) => [q.id, q.title]))
  const canRetry =
    Boolean(onRetry) && (result.attemptsLeft === null || result.attemptsLeft > 0)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-stack-lg">
      <section
        className={cn(
          "rounded-card border-2 border-border-strong p-card text-center shadow-hard-lg",
          result.passed ? "bg-academy-green-soft" : "bg-academy-coral-soft"
        )}
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-pill border-2 border-border-strong bg-surface-card">
          {result.passed ? (
            <IconTrophy aria-hidden className="size-8 text-academy-yellow" />
          ) : (
            <IconRefresh aria-hidden className="size-8" />
          )}
        </span>
        <h1 className="mt-stack text-section-title leading-display font-bold tracking-display">
          {result.passed ? labels.passedHeading : labels.failedHeading}
        </h1>
        <p className="mt-2 text-5xl font-bold tabular-nums">
          {Math.round(result.percentage)}%
        </p>
        <p className="mt-1 text-sm font-bold text-content-muted">
          {labels.passingGradeLabel}: {result.passingGrade}%
        </p>

        <dl className="mt-stack flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold">
          <div>
            <dt className="text-content-muted">{labels.scoreLabel}</dt>
            <dd className="tabular-nums">
              {round(result.earnedMarks)} / {round(result.possibleMarks)}
            </dd>
          </div>
          <div>
            <dt className="text-content-muted">correctas</dt>
            <dd className="tabular-nums">
              {labels.correctLabel
                .replace("{n}", String(result.correctCount))
                .replace("{total}", String(result.gradedCount))}
            </dd>
          </div>
          {result.excludedCount > 0 && (
            <div>
              <dt className="text-content-muted">·</dt>
              <dd>
                {labels.excludedNote.replace(
                  "{n}",
                  String(result.excludedCount)
                )}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-stack flex flex-wrap items-center justify-center gap-2">
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
            >
              <IconRefresh aria-hidden className="size-4" />
              {labels.retryCta}
            </button>
          )}
          <Link
            to={backToCourseHref}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
          >
            {labels.backToCourseCta}
          </Link>
        </div>
        {!canRetry && onRetry && (
          <p className="mt-2 text-label font-bold text-academy-coral">
            {labels.noAttemptsLeft}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-stack">
        <h2 className="text-card-title font-bold tracking-tight-brand">
          {labels.reviewTitle}
        </h2>
        {result.questionResults.map((qr, index) => {
          const badge = qr.excluded
            ? { label: labels.excludedBadge, tone: "bg-surface-muted", Icon: IconInfoCircle }
            : qr.correct
              ? { label: labels.correctBadge, tone: "bg-academy-green", Icon: IconCircleCheck }
              : { label: labels.incorrectBadge, tone: "bg-academy-coral", Icon: IconCircleX }
          return (
            <article
              key={qr.questionId}
              className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-bold">
                  {index + 1}. {titleById.get(qr.questionId) ?? ""}
                </h3>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-pill border-2 border-border-strong px-3 py-1 text-label font-bold",
                    badge.tone
                  )}
                >
                  <badge.Icon aria-hidden className="size-4" />
                  {badge.label}
                </span>
              </div>
              {!qr.excluded && (
                <p className="mt-1 text-label font-bold text-content-muted tabular-nums">
                  {round(qr.markEarned)} / {round(qr.markPossible)}
                </p>
              )}
              {qr.answerExplanation && (
                <div className="mt-stack rounded-card border-2 border-border-subtle bg-surface-page p-3">
                  <p className="text-label font-bold text-content-muted uppercase">
                    {labels.explanationLabel}
                  </p>
                  <p className="mt-1 text-sm">{qr.answerExplanation}</p>
                </div>
              )}
            </article>
          )
        })}
      </section>
    </div>
  )
}

function round(value: number): string {
  return (Math.round(value * 100) / 100).toString()
}
