import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@academy/user-ui/components/ui/sidebar"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconHelpCircle,
  IconListNumbers,
  IconLock,
  IconPlayerPlay,
  IconRepeat,
  IconTarget,
} from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import { CourseSidebar } from "../course/course-sidebar"
import { RichHtml } from "../rich-html"
import { QuestionInput } from "../quiz/question-input"
import { QuizResults } from "../quiz/quiz-results"
import type {
  CourseOutline,
  CourseViewerLabels,
} from "../../types/course-viewer"
import type {
  QuizAnswerDraft,
  QuizPageLabels,
  QuizResultView,
  QuizView,
} from "../../types/quiz"

export interface StudentQuizPageProps {
  quiz: QuizView
  labels: QuizPageLabels
  /** Course contents for the sidebar — the quiz lives inside the course viewer. */
  outline: CourseOutline
  viewerLabels: CourseViewerLabels
  /** Lang-scoped "Mis cursos" link for the sidebar. */
  coursesHref: string
  /** Where the results screen's "back" button goes. */
  backToCourseHref: string
  result?: QuizResultView | null
  isSubmitting?: boolean
  onSubmit: (payload: SubmitPayload) => void
  onRetry?: () => void
  /** Certificates-page link, present once the course is completed. */
  certificateHref?: string | null
}

/** The exact shape the route action expects. */
export interface SubmitPayload {
  quizId: string
  answers: {
    questionId: string
    selected?: string[]
    pairs?: { left: string; right: string }[]
  }[]
}

function toPayload(
  quiz: QuizView,
  drafts: Record<string, QuizAnswerDraft>
): SubmitPayload {
  return {
    quizId: quiz.id,
    answers: quiz.questions.map((question) => {
      const draft = drafts[question.id]
      // Sorting seeds from the shown order, so an untouched sorting question
      // still submits the order the student saw rather than nothing.
      const selected =
        question.type === "SORTING" && (!draft || draft.selected.length === 0)
          ? question.sortItems
          : (draft?.selected ?? [])
      const pairs = Object.entries(draft?.pairs ?? {}).map(([left, right]) => ({
        left,
        right,
      }))
      return {
        questionId: question.id,
        ...(selected.length > 0 ? { selected } : {}),
        ...(pairs.length > 0 ? { pairs } : {}),
      }
    }),
  }
}

/** Whether a question has any answer worth counting as "answered". */
function isAnswered(draft: QuizAnswerDraft | undefined): boolean {
  if (!draft) return false
  return (
    draft.selected.some((value) => value.trim() !== "") ||
    Object.keys(draft.pairs).length > 0
  )
}

export function StudentQuizPage({
  quiz,
  labels,
  outline,
  viewerLabels,
  coursesHref,
  backToCourseHref,
  result,
  isSubmitting,
  onSubmit,
  onRetry,
  certificateHref,
}: StudentQuizPageProps) {
  const [started, setStarted] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, QuizAnswerDraft>>({})
  const [index, setIndex] = useState(0)
  const [showUnanswered, setShowUnanswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.durationSeconds)
  const submittedRef = useRef(false)

  // No attempts remaining (0, and not unlimited): the quiz can't be started.
  const exhausted = quiz.attemptsLeft === 0

  const submit = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    onSubmit(toPayload(quiz, drafts))
  }

  // Countdown for timed quizzes; runs only once started, and auto-submits at
  // zero — so the clock doesn't tick while the student reads the intro.
  useEffect(() => {
    if (quiz.durationSeconds === null || result || !started) return
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          window.clearInterval(id)
          submit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.durationSeconds, result, started])

  const total = quiz.questions.length
  const answeredCount = useMemo(
    () => quiz.questions.filter((q) => isAnswered(drafts[q.id])).length,
    [quiz.questions, drafts]
  )

  const question = total > 0 ? quiz.questions[index] : null
  const setDraft = (draft: QuizAnswerDraft) => {
    if (!question) return
    setDrafts((current) => ({ ...current, [question.id]: draft }))
  }

  const onSubmitClick = () => {
    if (answeredCount < total) {
      setShowUnanswered(true)
      return
    }
    submit()
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <CourseSidebar
        outline={outline}
        activeItemId={quiz.id}
        labels={viewerLabels}
        coursesHref={coursesHref}
        certificateHref={certificateHref}
      />

      <SidebarInset className="min-w-0 bg-surface-page">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-border-strong bg-surface-card px-4 py-3">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">
            <p className="text-label font-bold text-content-muted uppercase">
              {viewerLabels.quizLabel}
            </p>
            <h1 className="truncate font-bold tracking-tight-brand">
              {quiz.title}
            </h1>
          </div>
          {timeLeft !== null && started && !result && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-pill border-2 border-border-strong px-3 py-1 font-bold tabular-nums",
                timeLeft <= 30 ? "bg-academy-coral" : "bg-surface-page"
              )}
              aria-live="polite"
            >
              <IconClock aria-hidden className="size-4" />
              {formatClock(timeLeft)}
            </span>
          )}
        </header>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-stack-lg p-4 md:p-card">
          {result ? (
            <QuizResults
              result={result}
              questions={quiz.questions}
              labels={labels}
              backToCourseHref={backToCourseHref}
              onRetry={onRetry}
            />
          ) : total === 0 || !question ? (
            <CenteredPanel
              icon={IconHelpCircle}
              title={labels.emptyTitle}
              description={labels.emptyDescription}
            >
              <Link
                to={backToCourseHref}
                className="inline-flex rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs"
              >
                {labels.backToCourseCta}
              </Link>
            </CenteredPanel>
          ) : exhausted ? (
            // No attempts remain: starting a fresh one would only be rejected on
            // submit, so it's blocked here with the standing instead.
            <CenteredPanel
              icon={IconLock}
              tone="bg-academy-coral-soft"
              title={labels.noAttemptsTitle}
              description={labels.noAttemptsBody.replace(
                "{max}",
                String(quiz.attemptsUsed)
              )}
            >
              <Link
                to={backToCourseHref}
                className="inline-flex rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs"
              >
                {labels.backToCourseCta}
              </Link>
            </CenteredPanel>
          ) : !started ? (
            <QuizIntro
              quiz={quiz}
              labels={labels}
              onStart={() => setStarted(true)}
            />
          ) : (
            <>
              {/* Progress: counter + dots that jump to any question. */}
              <div className="flex flex-col gap-stack rounded-card border-2 border-border-strong bg-surface-card p-3 shadow-hard-xs">
                <p className="text-label font-bold text-content-muted">
                  {labels.questionCounter
                    .replace("{n}", String(index + 1))
                    .replace("{total}", String(total))}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quiz.questions.map((q, i) => (
                    <button
                      key={q.id}
                      type="button"
                      aria-label={labels.questionCounter
                        .replace("{n}", String(i + 1))
                        .replace("{total}", String(total))}
                      aria-current={i === index}
                      onClick={() => setIndex(i)}
                      className={cn(
                        "size-3 rounded-pill border-2 border-border-strong transition-colors",
                        i === index
                          ? "bg-academy-ink"
                          : isAnswered(drafts[q.id])
                            ? "bg-academy-green"
                            : "bg-surface-card"
                      )}
                    />
                  ))}
                </div>
              </div>

              <section className="flex flex-col gap-stack rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-card-title font-bold tracking-tight-brand">
                    {question.title}
                  </h2>
                  <span className="shrink-0 rounded-pill border-2 border-border-strong bg-academy-yellow px-3 py-1 text-label font-bold tabular-nums">
                    {question.mark}{" "}
                    {question.mark === 1
                      ? labels.markSuffixSingular
                      : labels.markSuffixPlural}
                  </span>
                </div>

                {question.media && (
                  <img
                    src={question.media}
                    alt=""
                    className="max-h-72 w-full rounded-card border-2 border-border-strong object-contain"
                  />
                )}

                {/* Fill-in renders its own body (with blanks); others show it here. */}
                {question.description &&
                  question.type !== "FILL_IN_THE_BLANKS" && (
                    <RichHtml html={question.description} />
                  )}

                <QuestionInput
                  question={question}
                  draft={drafts[question.id] ?? { selected: [], pairs: {} }}
                  labels={labels}
                  onChange={setDraft}
                />
              </section>

              {showUnanswered && answeredCount < total && (
                <p
                  role="alert"
                  className="inline-flex items-center gap-2 rounded-card border-2 border-border-strong bg-academy-coral-soft p-3 text-sm font-bold"
                >
                  <IconAlertTriangle aria-hidden className="size-4" />
                  {labels.unansweredWarning}
                </p>
              )}

              <nav className="flex items-center justify-between gap-stack">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs disabled:pointer-events-none disabled:opacity-40"
                >
                  <IconChevronLeft aria-hidden className="size-4" />
                  {labels.previous}
                </button>

                {index === total - 1 ? (
                  <button
                    type="button"
                    onClick={onSubmitClick}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-green px-4 py-2 font-bold text-content-inverse shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm disabled:pointer-events-none disabled:opacity-60"
                  >
                    {isSubmitting ? labels.submitting : labels.submit}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                    className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
                  >
                    {labels.next}
                    <IconChevronRight aria-hidden className="size-4" />
                  </button>
                )}
              </nav>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Start gate: quiz facts + the button that begins the attempt (and the timer). */
function QuizIntro({
  quiz,
  labels,
  onStart,
}: {
  quiz: QuizView
  labels: QuizPageLabels
  onStart: () => void
}) {
  const facts: { icon: typeof IconTarget; text: string }[] = [
    {
      icon: IconListNumbers,
      text: labels.questionsCountLabel.replace(
        "{n}",
        String(quiz.questions.length)
      ),
    },
    {
      icon: IconTarget,
      text: `${labels.passingGradeLabel}: ${quiz.passingGrade}%`,
    },
  ]
  if (quiz.durationSeconds !== null) {
    facts.push({
      icon: IconClock,
      text: labels.timeLimitLabel.replace(
        "{time}",
        formatClock(quiz.durationSeconds)
      ),
    })
  }
  facts.push({
    icon: IconRepeat,
    text:
      quiz.attemptsLeft === null
        ? labels.unlimitedAttempts
        : labels.attemptsRemainingLabel.replace(
            "{n}",
            String(quiz.attemptsLeft)
          ),
  })

  return (
    <div className="rounded-card border-2 border-border-strong bg-surface-card p-card text-center shadow-hard-lg">
      <span className="mx-auto flex size-14 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-blue">
        <IconHelpCircle aria-hidden className="size-7" />
      </span>
      <h2 className="mt-stack text-card-title font-bold tracking-tight-brand">
        {labels.introHeading}
      </h2>

      {quiz.description && (
        <RichHtml
          html={quiz.description}
          className="mx-auto mt-stack text-left"
        />
      )}

      <dl className="mx-auto mt-stack-lg flex max-w-md flex-col gap-2">
        {facts.map((fact) => (
          <div
            key={fact.text}
            className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-page p-3 text-left font-bold"
          >
            <fact.icon aria-hidden className="size-5 shrink-0 text-content-muted" />
            {fact.text}
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onStart}
        className="mt-stack-lg inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-green px-6 py-3 font-bold text-content-inverse shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
      >
        <IconPlayerPlay aria-hidden className="size-5" />
        {labels.startCta}
      </button>
    </div>
  )
}

function CenteredPanel({
  icon: Icon,
  tone = "bg-surface-card",
  title,
  description,
  children,
}: {
  icon: typeof IconHelpCircle
  tone?: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-card border-2 border-border-strong p-card text-center shadow-hard-lg",
        tone
      )}
    >
      <Icon aria-hidden className="mx-auto size-10 text-content-muted" />
      <h2 className="mt-stack text-card-title font-bold tracking-tight-brand">
        {title}
      </h2>
      <p className="mt-1 text-content-muted">{description}</p>
      <div className="mt-stack">{children}</div>
    </div>
  )
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
