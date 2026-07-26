import { cn } from "@academy/user-ui/lib/utils"
import {
  IconCircleCheck,
  IconCircleX,
  IconConfetti,
  IconSparkles,
} from "@tabler/icons-react"
import { Fragment, useMemo, useState } from "react"
import type {
  PracticeBiteAnswerDraft,
  PracticeBiteItemResultView,
  PracticeBiteItemView,
  PracticeBiteResultView,
  PracticeBitesLabels,
  PracticeBiteView,
} from "../../types/practice-bites"

export interface StudentPracticeBitesProps {
  bite: PracticeBiteView
  labels: PracticeBitesLabels
  result?: PracticeBiteResultView | null
  isSubmitting?: boolean
  onSubmit: (payload: PracticeBiteSubmitPayload) => void
  onRetry?: () => void
}

/** The exact shape the practice-bite submit action expects. */
export interface PracticeBiteSubmitPayload {
  practiceBiteId: string
  answers: {
    itemId: string
    booleanAnswer?: boolean
    textAnswer?: string
    selectedOptions?: string[]
    matchingRows?: { columns: string[] }[]
  }[]
}

const BLANK_REGEX = /_{3,}/g
const MATCHING_COLUMN_COUNT = 4

function isAnswered(draft: PracticeBiteAnswerDraft | undefined): boolean {
  if (!draft) return false
  return (
    draft.booleanAnswer != null ||
    Boolean(draft.textAnswer?.trim()) ||
    Boolean(draft.selectedOptions?.some((v) => v && v.trim() !== "")) ||
    Boolean(draft.matchingRows?.length)
  )
}

function toPayload(
  bite: PracticeBiteView,
  drafts: Record<string, PracticeBiteAnswerDraft>
): PracticeBiteSubmitPayload {
  return {
    practiceBiteId: bite.id,
    answers: bite.items.map((item) => {
      const draft = drafts[item.id] ?? {}
      switch (item.type) {
        case "TRUE_FALSE":
          return { itemId: item.id, booleanAnswer: draft.booleanAnswer ?? false }
        case "IMAGE_SHORT_PHRASE":
          return { itemId: item.id, textAnswer: draft.textAnswer ?? "" }
        case "FILL_IN_THE_BLANKS":
          return { itemId: item.id, selectedOptions: draft.selectedOptions ?? [] }
        case "MATCHING_4_COLUMN":
          return {
            itemId: item.id,
            matchingRows: (draft.matchingRows ?? []).map((columns) => ({
              columns,
            })),
          }
        default:
          return { itemId: item.id }
      }
    }),
  }
}

/**
 * "Práctica rápida" — the gamified item set attached to a lesson. Server-graded:
 * a submission returns per-item feedback, and the solution only appears once the
 * server has unlocked it (after enough attempts).
 */
export function StudentPracticeBites({
  bite,
  labels,
  result,
  isSubmitting,
  onSubmit,
  onRetry,
}: StudentPracticeBitesProps) {
  const [drafts, setDrafts] = useState<Record<string, PracticeBiteAnswerDraft>>(
    {}
  )

  const resultsByItem = useMemo(() => {
    const map = new Map<string, PracticeBiteItemResultView>()
    result?.itemResults.forEach((r) => map.set(r.itemId, r))
    return map
  }, [result])

  const answeredCount = bite.items.filter((item) =>
    isAnswered(drafts[item.id])
  ).length
  const allAnswered = answeredCount === bite.items.length

  const setDraft = (itemId: string, draft: PracticeBiteAnswerDraft) =>
    setDrafts((current) => ({ ...current, [itemId]: draft }))

  return (
    <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-card-title font-bold tracking-tight-brand">
          <IconSparkles aria-hidden className="size-5 text-academy-yellow" />
          {bite.title}
        </h2>
        {bite.attempts > 0 && (
          <span className="text-label font-bold text-content-muted">
            {labels.attemptsLabel.replace("{n}", String(bite.attempts))}
          </span>
        )}
      </div>
      {bite.description && (
        <p className="mt-1 text-sm text-content-muted">{bite.description}</p>
      )}

      {result ? (
        <div
          className={cn(
            "mt-stack flex items-center gap-3 rounded-card border-2 border-border-strong p-3",
            result.isPerfect ? "bg-academy-green-soft" : "bg-surface-page"
          )}
        >
          {result.isPerfect && (
            <IconConfetti aria-hidden className="size-6 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {labels.resultSummary
                .replace("{correct}", String(result.correctCount))
                .replace("{total}", String(result.totalCount))
                .replace("{score}", String(Math.round(result.score * 100)))}
            </p>
            <p className="text-sm text-content-muted">{result.message}</p>
          </div>
        </div>
      ) : (
        <div className="mt-stack">
          <div className="h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted">
            <div
              className="h-full bg-academy-green transition-[width] duration-300 ease-academy"
              style={{
                width: `${bite.items.length ? (answeredCount / bite.items.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="mt-1 text-label font-bold text-content-muted">
            {labels.progressLabel
              .replace("{answered}", String(answeredCount))
              .replace("{total}", String(bite.items.length))}
          </p>
        </div>
      )}

      <div className="mt-stack-lg flex flex-col gap-stack">
        {bite.items.map((item, index) => (
          <PracticeBiteItem
            key={item.id}
            item={item}
            index={index}
            draft={drafts[item.id] ?? {}}
            result={resultsByItem.get(item.id)}
            disabled={Boolean(result)}
            labels={labels}
            onChange={(draft) => setDraft(item.id, draft)}
          />
        ))}
      </div>

      <div className="mt-stack-lg flex justify-end">
        {result ? (
          onRetry && (
            <button
              type="button"
              onClick={() => {
                setDrafts({})
                onRetry()
              }}
              className="rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5"
            >
              {labels.retry}
            </button>
          )
        ) : (
          <button
            type="button"
            disabled={!allAnswered || isSubmitting}
            onClick={() => onSubmit(toPayload(bite, drafts))}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-green px-4 py-2 font-bold text-content-inverse shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? labels.submitting : labels.submit}
          </button>
        )}
      </div>
    </section>
  )
}

function PracticeBiteItem({
  item,
  index,
  draft,
  result,
  disabled,
  labels,
  onChange,
}: {
  item: PracticeBiteItemView
  index: number
  draft: PracticeBiteAnswerDraft
  result?: PracticeBiteItemResultView
  disabled: boolean
  labels: PracticeBitesLabels
  onChange: (draft: PracticeBiteAnswerDraft) => void
}) {
  return (
    <div
      className={cn(
        "rounded-card border-2 border-border-strong bg-surface-page p-card shadow-hard-xs",
        result?.correct && "border-academy-green",
        result && !result.correct && "border-academy-coral"
      )}
    >
      <div className="mb-stack flex items-start justify-between gap-3">
        <p className="font-bold">
          <span className="mr-2 text-content-muted">{index + 1}.</span>
          {item.type === "FILL_IN_THE_BLANKS"
            ? labels.fillInInstruction
            : item.prompt}
        </p>
        {result &&
          (result.correct ? (
            <IconCircleCheck aria-hidden className="size-5 shrink-0 text-academy-green" />
          ) : (
            <IconCircleX aria-hidden className="size-5 shrink-0 text-academy-coral" />
          ))}
      </div>

      {item.type === "TRUE_FALSE" && (
        <TrueFalseItem
          draft={draft}
          disabled={disabled}
          labels={labels}
          onChange={onChange}
        />
      )}
      {item.type === "IMAGE_SHORT_PHRASE" && (
        <ImagePhraseItem
          item={item}
          draft={draft}
          disabled={disabled}
          labels={labels}
          onChange={onChange}
        />
      )}
      {item.type === "FILL_IN_THE_BLANKS" && (
        <FillInBlanksItem
          item={item}
          draft={draft}
          disabled={disabled}
          labels={labels}
          onChange={onChange}
        />
      )}
      {item.type === "MATCHING_4_COLUMN" && (
        <MatchingItem
          item={item}
          draft={draft}
          disabled={disabled}
          labels={labels}
          onChange={onChange}
        />
      )}

      {result && (
        <div className="mt-stack rounded-card border-2 border-border-subtle bg-surface-card p-3 text-sm">
          <p
            className={cn(
              "font-bold",
              result.correct ? "text-academy-green" : "text-academy-coral"
            )}
          >
            {result.feedback}
          </p>
          {result.solutionRevealed && result.answerExplanation && (
            <p className="mt-1 text-content-muted">{result.answerExplanation}</p>
          )}
          {result.solutionRevealed && result.solution && (
            <RevealedSolution
              type={item.type}
              solution={result.solution}
              labels={labels}
            />
          )}
        </div>
      )}
    </div>
  )
}

const cellSelect =
  "rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:opacity-70"

function TrueFalseItem({
  draft,
  disabled,
  labels,
  onChange,
}: {
  draft: PracticeBiteAnswerDraft
  disabled: boolean
  labels: PracticeBitesLabels
  onChange: (draft: PracticeBiteAnswerDraft) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((value) => (
        <button
          key={String(value)}
          type="button"
          disabled={disabled}
          aria-pressed={draft.booleanAnswer === value}
          onClick={() => onChange({ booleanAnswer: value })}
          className={cn(
            "rounded-card border-2 border-border-strong py-3 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-70",
            draft.booleanAnswer === value
              ? value
                ? "bg-academy-green shadow-hard-sm"
                : "bg-academy-coral shadow-hard-sm"
              : "bg-surface-card shadow-hard-xs"
          )}
        >
          {value ? labels.trueLabel : labels.falseLabel}
        </button>
      ))}
    </div>
  )
}

function ImagePhraseItem({
  item,
  draft,
  disabled,
  labels,
  onChange,
}: {
  item: PracticeBiteItemView
  draft: PracticeBiteAnswerDraft
  disabled: boolean
  labels: PracticeBitesLabels
  onChange: (draft: PracticeBiteAnswerDraft) => void
}) {
  return (
    <div className="flex flex-col gap-stack">
      {item.media && (
        <img
          src={item.media}
          alt=""
          className="max-h-64 w-full rounded-card border-2 border-border-strong object-contain"
        />
      )}
      <input
        type="text"
        value={draft.textAnswer ?? ""}
        disabled={disabled}
        onChange={(event) => onChange({ textAnswer: event.target.value })}
        placeholder={labels.textPlaceholder}
        className="rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 font-bold placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:opacity-70"
      />
    </div>
  )
}

function FillInBlanksItem({
  item,
  draft,
  disabled,
  labels,
  onChange,
}: {
  item: PracticeBiteItemView
  draft: PracticeBiteAnswerDraft
  disabled: boolean
  labels: PracticeBitesLabels
  onChange: (draft: PracticeBiteAnswerDraft) => void
}) {
  const segments = item.prompt.split(BLANK_REGEX)
  const blanks = (item.prompt.match(BLANK_REGEX) ?? []).length
  const selected = draft.selectedOptions ?? []

  const setBlank = (blankIndex: number, value: string) => {
    const next = [...selected]
    while (next.length < blanks) next.push("")
    next[blankIndex] = value
    onChange({ selectedOptions: next })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 leading-9">
      {Array.from({ length: blanks }).map((_, blankIndex) => (
        <Fragment key={blankIndex}>
          {segments[blankIndex] && <span>{segments[blankIndex]}</span>}
          <select
            value={selected[blankIndex] ?? ""}
            disabled={disabled}
            onChange={(event) => setBlank(blankIndex, event.target.value)}
            className={cn(cellSelect, "min-w-32")}
          >
            <option value="">
              {labels.blankPlaceholder.replace("{n}", String(blankIndex + 1))}
            </option>
            {item.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Fragment>
      ))}
      {segments.length > blanks && <span>{segments[segments.length - 1]}</span>}
    </div>
  )
}

function MatchingItem({
  item,
  draft,
  disabled,
  labels,
  onChange,
}: {
  item: PracticeBiteItemView
  draft: PracticeBiteAnswerDraft
  disabled: boolean
  labels: PracticeBitesLabels
  onChange: (draft: PracticeBiteAnswerDraft) => void
}) {
  const columns = item.matchingColumns
  const anchors = columns[0] ?? []

  // Seed each row with its anchor in column 0; the learner fills the rest.
  const rows =
    draft.matchingRows ??
    anchors.map((anchor) => {
      const row = Array.from({ length: MATCHING_COLUMN_COUNT }, () => "")
      row[0] = anchor
      return row
    })

  const setCell = (rowIndex: number, colIndex: number, value: string) => {
    const next = rows.map((row) => [...row])
    next[rowIndex][colIndex] = value
    onChange({ matchingRows: next })
  }

  if (anchors.length === 0) {
    return <p className="text-sm text-content-muted">{labels.noColumns}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {anchors.map((anchor, rowIndex) => (
        <div key={anchor} className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 rounded-card border-2 border-border-strong bg-surface-muted px-3 py-2 font-bold">
            {anchor}
          </div>
          {Array.from({ length: MATCHING_COLUMN_COUNT - 1 }).map((_, offset) => {
            const colIndex = offset + 1
            return (
              <select
                key={colIndex}
                value={rows[rowIndex]?.[colIndex] ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  setCell(rowIndex, colIndex, event.target.value)
                }
                className={cn(cellSelect, "flex-1")}
              >
                <option value="">
                  {labels.columnPlaceholder.replace(
                    "{n}",
                    String(colIndex + 1)
                  )}
                </option>
                {(columns[colIndex] ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function RevealedSolution({
  type,
  solution,
  labels,
}: {
  type: PracticeBiteItemView["type"]
  solution: NonNullable<PracticeBiteItemResultView["solution"]>
  labels: PracticeBitesLabels
}) {
  return (
    <div className="mt-1 border-t-2 border-border-subtle pt-2 text-content-muted">
      <span className="font-bold text-content-primary">
        {labels.correctAnswerLabel}{" "}
      </span>
      {type === "TRUE_FALSE" &&
        (solution.correctBoolean ? labels.trueLabel : labels.falseLabel)}
      {type === "IMAGE_SHORT_PHRASE" && solution.acceptedAnswers.join(", ")}
      {type === "FILL_IN_THE_BLANKS" && solution.blanks.join(", ")}
      {type === "MATCHING_4_COLUMN" && (
        <ul className="mt-1 list-disc pl-5">
          {solution.matchingRows.map((columns) => (
            <li key={columns.join("|")}>{columns.join(" — ")}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
