import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
} from "@tabler/icons-react"
import { RichHtml } from "../rich-html"
import type {
  QuizAnswerDraft,
  QuizPageLabels,
  QuizQuestionView,
} from "../../types/quiz"

export interface QuestionInputProps {
  question: QuizQuestionView
  draft: QuizAnswerDraft
  labels: QuizPageLabels
  onChange: (draft: QuizAnswerDraft) => void
}

const emptyDraft: QuizAnswerDraft = { selected: [], pairs: {} }

/** Dispatches to the input for the question's type. */
export function QuestionInput({
  question,
  draft,
  labels,
  onChange,
}: QuestionInputProps) {
  const props = { question, draft: draft ?? emptyDraft, labels, onChange }
  switch (question.type) {
    case "SINGLE_CHOICE":
      return <ChoiceInput {...props} multiple={false} />
    case "MULTIPLE_CHOICE":
      return <ChoiceInput {...props} multiple />
    case "TRUE_FALSE":
      return <TrueFalseInput {...props} />
    case "FILL_IN_THE_BLANKS":
      return <FillInInput {...props} />
    case "SORTING":
      return <SortingInput {...props} />
    case "MATRIX_SORTING":
      return <MatrixInput {...props} />
    default:
      return null
  }
}

const optionBase =
  "flex w-full items-center gap-3 rounded-card border-2 border-border-strong p-3 text-left font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"

function ChoiceInput({
  question,
  draft,
  labels,
  onChange,
  multiple,
}: QuestionInputProps & { multiple: boolean }) {
  const selected = new Set(draft.selected)

  const toggle = (option: string) => {
    if (multiple) {
      const next = new Set(selected)
      if (next.has(option)) next.delete(option)
      else next.add(option)
      onChange({ ...draft, selected: [...next] })
    } else {
      onChange({ ...draft, selected: [option] })
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-label font-bold text-content-muted">
        {multiple ? labels.chooseMany : labels.chooseOne}
      </legend>
      {question.options.map((option) => {
        const isOn = selected.has(option)
        return (
          <button
            key={option}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isOn}
            onClick={() => toggle(option)}
            className={cn(
              optionBase,
              isOn ? "bg-academy-yellow shadow-hard-sm" : "bg-surface-card shadow-hard-xs"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center border-2 border-border-strong",
                multiple ? "rounded-lg" : "rounded-pill",
                isOn && "bg-academy-ink"
              )}
            >
              {isOn && <span className="size-2 rounded-[1px] bg-surface-card" />}
            </span>
            <span className="min-w-0 flex-1">{option}</span>
          </button>
        )
      })}
    </fieldset>
  )
}

function TrueFalseInput({ draft, labels, onChange }: QuestionInputProps) {
  const options: { value: string; label: string; tone: string }[] = [
    { value: "True", label: labels.trueLabel, tone: "bg-academy-green" },
    { value: "False", label: labels.falseLabel, tone: "bg-academy-coral" },
  ]
  const selected = draft.selected[0]
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup">
      {options.map((option) => {
        const isOn = selected === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isOn}
            onClick={() => onChange({ ...draft, selected: [option.value] })}
            className={cn(
              "rounded-card border-2 border-border-strong p-4 text-lg font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
              isOn ? `${option.tone} shadow-hard-sm` : "bg-surface-card shadow-hard-xs"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Inline marker the loader-sanitized body renders where each `{dash}` was. */
function blankMarker(index: number): string {
  return `<span class="mx-1 inline-flex min-w-12 items-center justify-center border-b-4 border-academy-blue px-1 font-bold text-academy-blue align-middle">${index + 1}</span>`
}

function FillInInput({ question, draft, labels, onChange }: QuestionInputProps) {
  const count = question.blankCount
  // Number the blanks in the sentence; the inputs below are numbered to match.
  let cursor = 0
  const body = (question.description ?? "").replace(/\{dash\}/g, () =>
    blankMarker(cursor++)
  )

  const setBlank = (index: number, value: string) => {
    const next = [...draft.selected]
    while (next.length < count) next.push("")
    next[index] = value
    onChange({ ...draft, selected: next })
  }

  return (
    <div className="flex flex-col gap-stack">
      {body && (
        <RichHtml
          html={body}
          className="rounded-card border-2 border-border-strong bg-surface-page p-3"
        />
      )}
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <label key={index} className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-yellow text-sm font-bold">
              {index + 1}
            </span>
            <input
              type="text"
              value={draft.selected[index] ?? ""}
              onChange={(event) => setBlank(index, event.target.value)}
              placeholder={labels.fillPlaceholder}
              className="min-w-0 flex-1 rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 font-bold placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function SortingInput({ question, draft, labels, onChange }: QuestionInputProps) {
  // Seed the order from the server's shuffled items on first render.
  const order =
    draft.selected.length === question.sortItems.length
      ? draft.selected
      : question.sortItems

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // A small threshold so a click on the up/down buttons isn't read as a drag.
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const setOrder = (next: string[]) => onChange({ ...draft, selected: next })

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= order.length) return
    setOrder(arrayMove(order, index, target))
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-bold text-content-muted">
        {labels.orderInstruction}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return
          const from = order.indexOf(String(active.id))
          const to = order.indexOf(String(over.id))
          if (from < 0 || to < 0) return
          setOrder(arrayMove(order, from, to))
        }}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {order.map((item, index) => (
              <SortableRow
                key={item}
                id={item}
                index={index}
                total={order.length}
                labels={labels}
                onMove={move}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

/**
 * A draggable row. @dnd-kit gives mouse and keyboard dragging (grab the handle,
 * then arrow keys); the up/down buttons are kept as an always-obvious, touch-
 * friendly fallback.
 */
function SortableRow({
  id,
  index,
  total,
  labels,
  onMove,
}: {
  id: string
  index: number
  total: number
  labels: QuizPageLabels
  onMove: (index: number, delta: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-card border-2 border-border-strong bg-surface-card p-2 shadow-hard-xs",
        isDragging && "relative z-10 shadow-hard-md"
      )}
    >
      <button
        type="button"
        aria-label={labels.dragToReorder}
        className="shrink-0 cursor-grab touch-none rounded-button p-1 text-content-muted hover:bg-surface-muted active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical aria-hidden className="size-5" />
      </button>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-yellow text-sm font-bold tabular-nums">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 font-bold">{id}</span>
      <span className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label={labels.moveUp}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="rounded-t-button border-2 border-b-0 border-border-strong px-2 disabled:opacity-30"
        >
          <IconChevronUp aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          aria-label={labels.moveDown}
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          className="rounded-b-button border-2 border-border-strong px-2 disabled:opacity-30"
        >
          <IconChevronDown aria-hidden className="size-4" />
        </button>
      </span>
    </li>
  )
}

function MatrixInput({ question, draft, labels, onChange }: QuestionInputProps) {
  const setPair = (left: string, right: string) => {
    const pairs = { ...draft.pairs }
    if (right) pairs[left] = right
    else delete pairs[left]
    onChange({ ...draft, pairs })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-bold text-content-muted">
        {labels.matchInstruction}
      </p>
      {question.matrixLeft.map((left) => (
        <div
          key={left}
          className="flex flex-wrap items-center gap-3 rounded-card border-2 border-border-strong bg-surface-card p-3 shadow-hard-xs"
        >
          <span className="min-w-0 flex-1 font-bold">{left}</span>
          <select
            value={draft.pairs[left] ?? ""}
            onChange={(event) => setPair(left, event.target.value)}
            className="rounded-button border-2 border-border-strong bg-surface-page px-3 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <option value="">{labels.matchPlaceholder}</option>
            {question.matrixRight.map((right) => (
              <option key={right} value={right}>
                {right}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
