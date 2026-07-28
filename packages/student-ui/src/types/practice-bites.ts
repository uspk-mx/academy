/**
 * Presentational contract for the practice-bites widget rendered inside a
 * lesson. The route maps `practiceBitesByLessonId` onto `PracticeBiteView`;
 * there is no answer key here — the server strips it and grades on submit.
 */

export type PracticeBiteItemType =
  | "TRUE_FALSE"
  | "IMAGE_SHORT_PHRASE"
  | "FILL_IN_THE_BLANKS"
  | "MATCHING_4_COLUMN"

export interface PracticeBiteItemView {
  id: string
  type: PracticeBiteItemType
  /** FILL_IN_THE_BLANKS marks blanks with runs of 3+ underscores. */
  prompt: string
  media: string | null
  /** FILL_IN_THE_BLANKS: options offered for every blank. */
  options: string[]
  /** MATCHING_4_COLUMN: independently shuffled columns (col 0 = anchors). */
  matchingColumns: string[][]
}

export interface PracticeBiteView {
  id: string
  title: string
  description: string | null
  attempts: number
  completed: boolean
  items: PracticeBiteItemView[]
}

/** A learner's in-progress answer to one item; only the type's field is set. */
export interface PracticeBiteAnswerDraft {
  booleanAnswer?: boolean
  textAnswer?: string
  /** per blank, in order */
  selectedOptions?: string[]
  /** rows of column cells (col 0 is the fixed anchor) */
  matchingRows?: string[][]
}

/** Per-item feedback from a submission. Solution only when the server unlocks it. */
export interface PracticeBiteItemResultView {
  itemId: string
  correct: boolean
  feedback: string
  answerExplanation: string | null
  solutionRevealed: boolean
  solution: {
    correctBoolean: boolean | null
    acceptedAnswers: string[]
    blanks: string[]
    matchingRows: string[][]
  } | null
}

export interface PracticeBiteResultView {
  practiceBiteId: string
  completed: boolean
  score: number
  correctCount: number
  totalCount: number
  attempts: number
  isPerfect: boolean
  message: string
  itemResults: PracticeBiteItemResultView[]
}

export interface PracticeBitesLabels {
  sectionTitle: string
  attemptsLabel: string // "Intentos: {n}"
  progressLabel: string // "{answered} de {total}"
  submit: string
  submitting: string
  retry: string
  resultSummary: string // "{correct} de {total} correctas · {score}%"
  perfectHeading: string
  trueLabel: string
  falseLabel: string
  textPlaceholder: string
  blankPlaceholder: string // "Espacio {n}"
  columnPlaceholder: string // "Columna {n}"
  fillInInstruction: string
  correctAnswerLabel: string
  noColumns: string
}

export const defaultPracticeBitesLabels: PracticeBitesLabels = {
  sectionTitle: "Práctica rápida",
  attemptsLabel: "Intentos: {n}",
  progressLabel: "{answered} de {total}",
  submit: "Enviar respuestas",
  submitting: "Enviando…",
  retry: "Intentar de nuevo",
  resultSummary: "{correct} de {total} correctas · {score}%",
  perfectHeading: "¡Perfecto! 🎉",
  trueLabel: "Verdadero",
  falseLabel: "Falso",
  textPlaceholder: "Escribe tu respuesta…",
  blankPlaceholder: "Espacio {n}",
  columnPlaceholder: "Columna {n}",
  fillInInstruction: "Completa los espacios",
  correctAnswerLabel: "Respuesta correcta:",
  noColumns: "Este elemento no tiene columnas para relacionar.",
}

export const practiceBitesLabels: Record<"es" | "en", PracticeBitesLabels> = {
  es: defaultPracticeBitesLabels,
  en: {
    sectionTitle: "Quick practice",
    attemptsLabel: "Attempts: {n}",
    progressLabel: "{answered} of {total}",
    submit: "Submit answers",
    submitting: "Submitting…",
    retry: "Try again",
    resultSummary: "{correct} of {total} correct · {score}%",
    perfectHeading: "Perfect! 🎉",
    trueLabel: "True",
    falseLabel: "False",
    textPlaceholder: "Type your answer…",
    blankPlaceholder: "Blank {n}",
    columnPlaceholder: "Column {n}",
    fillInInstruction: "Fill in the blanks",
    correctAnswerLabel: "Correct answer:",
    noColumns: "This item has no columns to match.",
  },
}
