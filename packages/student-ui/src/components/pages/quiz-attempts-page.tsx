import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAward,
  IconBook2,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconFilter,
  IconHelpCircle,
  IconTrendingUp,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link } from "react-router"
import type {
  QuizAttemptFilter,
  QuizAttemptsPageLabels,
  StudentQuizAttempt,
} from "../../types/quiz-attempts"

export interface StudentQuizAttemptsPageProps {
  items: StudentQuizAttempt[]
  labels: QuizAttemptsPageLabels
  /** Lang-scoped "Mis Cursos" link for the empty state. */
  coursesHref: string
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}

/**
 * "Mis Intentos de Quizzes" — the full append-only history from
 * `myQuizAttempts`, so repeated attempts at the same quiz each get a card.
 *
 * Stats run over the FULL list and only the cards are filtered, so the totals
 * don't shift as you change the filter.
 */
export function StudentQuizAttemptsPage({
  items,
  labels,
  coursesHref,
}: StudentQuizAttemptsPageProps) {
  // Local state: the list is already in memory, so filtering client-side costs
  // nothing, while a URL param would revalidate every matched loader.
  const [filter, setFilter] = useState<QuizAttemptFilter>("all")

  const total = items.length
  const passed = items.filter((item) => item.passed).length
  const failed = total - passed
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
  const average =
    total > 0
      ? Math.round(items.reduce((sum, item) => sum + item.percentage, 0) / total)
      : 0
  const best = total > 0 ? Math.max(...items.map((item) => item.percentage)) : 0

  const visible = items.filter((item) => {
    if (filter === "passed") return item.passed
    if (filter === "failed") return !item.passed
    return true
  })

  const hasAttempts = total > 0
  const showNoResults = hasAttempts && visible.length === 0

  const filterTabs: { value: QuizAttemptFilter; label: string }[] = [
    { value: "all", label: labels.filterAll },
    { value: "passed", label: labels.filterPassed },
    { value: "failed", label: labels.filterFailed },
  ]

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-blue p-2">
            <IconHelpCircle aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              {labels.pageTitle}
            </h1>
            {hasAttempts && (
              <p className="text-sm text-content-muted">
                {total}{" "}
                {total === 1
                  ? labels.totalSuffixSingular
                  : labels.totalSuffixPlural}{" "}
                • {labels.passRateSuffix}: {passRate}%
              </p>
            )}
          </div>
        </div>
      </header>

      {hasAttempts && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatTile
              icon={IconBook2}
              tone="bg-academy-blue"
              label={labels.statsTotal}
              value={total}
            />
            <StatTile
              icon={IconCircleCheck}
              tone="bg-academy-green"
              label={labels.statsPassed}
              value={passed}
            />
            <StatTile
              icon={IconCircleX}
              tone="bg-academy-coral"
              label={labels.statsFailed}
              value={failed}
            />
            <StatTile
              icon={IconTrendingUp}
              tone="bg-academy-yellow"
              label={labels.statsPassRate}
              value={`${passRate}%`}
            />
            <StatTile
              icon={IconAward}
              tone="bg-surface-muted"
              label={labels.statsAverage}
              value={`${average}%`}
            />
            <StatTile
              icon={IconAward}
              tone="bg-academy-green"
              label={labels.statsBest}
              value={`${best}%`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{labels.filterLabel}</span>
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={filter === tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "rounded-button border-2 border-border-strong px-4 py-2 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                  filter === tab.value
                    ? "bg-academy-ink text-content-inverse shadow-hard-sm"
                    : "bg-surface-card shadow-hard-xs"
                )}
              >
                {tab.label}
              </button>
            ))}
            <p
              className="ml-2 text-sm font-bold text-content-muted"
              aria-live="polite"
            >
              ({visible.length}{" "}
              {visible.length === 1
                ? labels.resultsSingular
                : labels.resultsPlural}
              )
            </p>
          </div>
        </>
      )}

      {!hasAttempts && (
        <EmptyPanel
          icon={IconHelpCircle}
          tone="bg-academy-blue"
          title={labels.emptyTitle}
          description={labels.emptyDescription}
        >
          <Link
            to={coursesHref}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.emptyCta}
          </Link>
        </EmptyPanel>
      )}

      {showNoResults && (
        <EmptyPanel
          icon={IconFilter}
          tone="bg-surface-muted"
          title={labels.noResultsTitle}
          description={labels.noResultsDescription}
        >
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.clearFilterCta}
          </button>
        </EmptyPanel>
      )}

      {visible.length > 0 && (
        <div className="grid gap-stack md:grid-cols-2">
          {visible.map((attempt) => (
            <AttemptCard key={attempt.id} attempt={attempt} labels={labels} />
          ))}
        </div>
      )}
    </div>
  )
}

function AttemptCard({
  attempt,
  labels,
}: {
  attempt: StudentQuizAttempt
  labels: QuizAttemptsPageLabels
}) {
  const attemptedAt = formatDate(attempt.attemptedAt)
  const attemptLabel =
    attempt.maxAttempts != null
      ? labels.attemptNumberOfLabel
          .replace("{n}", String(attempt.attemptNumber))
          .replace("{max}", String(attempt.maxAttempts))
      : labels.attemptNumberLabel.replace("{n}", String(attempt.attemptNumber))

  return (
    <article className="overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg">
      <div
        className={cn(
          "flex items-start justify-between gap-3 border-b-2 border-border-strong p-card",
          attempt.passed ? "bg-academy-green-soft" : "bg-academy-coral-soft"
        )}
      >
        <div className="min-w-0">
          <h2 className="text-card-title font-bold tracking-tight-brand">
            {attempt.quizTitle}
          </h2>
          <p className="truncate text-sm text-content-muted">
            {attempt.courseTitle}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-pill border-2 border-border-strong px-3 py-1 text-sm font-bold",
            attempt.passed ? "bg-academy-green" : "bg-academy-coral"
          )}
        >
          {attempt.passed ? (
            <IconCircleCheck aria-hidden className="size-4" />
          ) : (
            <IconCircleX aria-hidden className="size-4" />
          )}
          {attempt.passed ? labels.passedBadge : labels.failedBadge}
        </span>
      </div>

      <div className="flex flex-col gap-stack p-card">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-content-muted">
          <span className="inline-flex items-center gap-2 font-bold">
            <IconClock aria-hidden className="size-4" />
            {attemptedAt ?? "—"}
          </span>
          <span className="font-bold">{attemptLabel}</span>
        </div>

        <div className="flex items-center justify-between rounded-card border-2 border-border-strong bg-academy-yellow p-4">
          <div>
            <p className="text-label font-bold">{labels.scoreLabel}</p>
            <p className="text-4xl leading-none font-bold tabular-nums">
              {attempt.percentage}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-label font-bold">{labels.marksLabel}</p>
            <p className="text-2xl leading-none font-bold tabular-nums">
              {attempt.earnedMarks}/{attempt.totalMarks}
            </p>
          </div>
        </div>

        {/*
          A bar rather than correct/incorrect tiles: the API stores only the
          total score, never which answers were right, so those counts don't
          exist. This shows the score against the pass mark instead.
        */}
        <div className="flex flex-col gap-1.5">
          <div
            className="relative h-3 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted"
            role="img"
            aria-label={`${attempt.percentage}% / ${attempt.passingGrade}%`}
          >
            <div
              className={cn(
                "h-full",
                attempt.passed ? "bg-academy-green" : "bg-academy-coral"
              )}
              style={{ width: `${Math.min(attempt.percentage, 100)}%` }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 w-0.5 bg-academy-ink"
              style={{ left: `${Math.min(attempt.passingGrade, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-label font-bold text-content-muted">
            <span>
              {attempt.questionCount} {labels.questionsLabel}
            </span>
            <span>
              {labels.passingGradeLabel}: {attempt.passingGrade}%
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconClock
  tone: string
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-card p-4 shadow-hard-sm">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-button border-2 border-border-strong",
          tone
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-none font-bold tabular-nums">{value}</p>
        <p className="truncate text-label font-bold text-content-muted">
          {label}
        </p>
      </div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: typeof IconClock
  tone: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
      <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-card border-2 border-border-strong",
            tone
          )}
        >
          <Icon aria-hidden className="size-8" />
        </span>
        <h2 className="text-card-title font-bold tracking-tight-brand">
          {title}
        </h2>
        <p className="text-content-muted">{description}</p>
        {children}
      </div>
    </div>
  )
}
