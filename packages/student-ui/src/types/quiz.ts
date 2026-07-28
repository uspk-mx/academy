/**
 * Presentational contract for the quiz player. The route maps `quizForAttempt`
 * onto `QuizView`; the component never touches GraphQL. Crucially there is no
 * answer key here — the server already stripped it, and grading is server-side.
 */

export type QuizQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_IN_THE_BLANKS"
  | "SORTING"
  | "MATRIX_SORTING"

export interface QuizQuestionView {
  id: string
  title: string
  /** HTML body; for fill-in it carries `{dash}` markers (one per blank). */
  description: string | null
  media: string | null
  type: QuizQuestionType
  mark: number
  /** choice / true-false */
  options: string[]
  /** sorting — already shuffled by the server */
  sortItems: string[]
  /** matrix left column (fixed) */
  matrixLeft: string[]
  /** matrix right pool (shuffled) */
  matrixRight: string[]
  /** fill-in blank count */
  blankCount: number
}

export interface QuizView {
  id: string
  title: string
  description: string | null
  /** Seconds; null = untimed. Derived from timer + timeUnit by the route. */
  durationSeconds: number | null
  passingGrade: number
  attemptsUsed: number
  /** null = unlimited */
  attemptsLeft: number | null
  questions: QuizQuestionView[]
}

/**
 * A student's in-progress answer to one question, kept in the player's local
 * state and sent verbatim to the action on submit.
 */
export interface QuizAnswerDraft {
  /** choice / true-false / sorting / fill-in (per blank, in order) */
  selected: string[]
  /** matrix: left column -> chosen right */
  pairs: Record<string, string>
}

export interface QuizQuestionResultView {
  questionId: string
  correct: boolean
  excluded: boolean
  markEarned: number
  markPossible: number
  answerExplanation: string | null
}

export interface QuizResultView {
  attemptId: string
  earnedMarks: number
  possibleMarks: number
  percentage: number
  passed: boolean
  passingGrade: number
  correctCount: number
  gradedCount: number
  excludedCount: number
  attemptsUsed: number
  attemptsLeft: number | null
  questionResults: QuizQuestionResultView[]
}

export interface QuizPageLabels {
  questionCounter: string // "{n} de {total}"
  markSuffixSingular: string
  markSuffixPlural: string
  previous: string
  next: string
  submit: string
  submitting: string
  unansweredWarning: string
  timeLeft: string
  timeUp: string
  trueLabel: string
  falseLabel: string
  chooseOne: string
  chooseMany: string
  orderInstruction: string
  matchInstruction: string
  matchPlaceholder: string
  fillPlaceholder: string
  moveUp: string
  moveDown: string
  dragToReorder: string
  attemptsUsedLabel: string // "{used} de {max}"
  unlimitedAttempts: string
  // intro / start gate
  introHeading: string
  startCta: string
  questionsCountLabel: string // "{n} preguntas"
  timeLimitLabel: string // "Tiempo límite: {time}"
  attemptsRemainingLabel: string // "{n} intentos restantes"
  noAttemptsTitle: string
  noAttemptsBody: string // "{max}"
  // results
  resultTitle: string
  passedHeading: string
  failedHeading: string
  scoreLabel: string
  correctLabel: string // "{n} de {total} correctas"
  excludedNote: string // "{n} preguntas no calificadas"
  passingGradeLabel: string
  reviewTitle: string
  correctBadge: string
  incorrectBadge: string
  excludedBadge: string
  explanationLabel: string
  retryCta: string
  backToCourseCta: string
  noAttemptsLeft: string
  // empty / error
  emptyTitle: string
  emptyDescription: string
}

export const defaultQuizPageLabels: QuizPageLabels = {
  questionCounter: "{n} de {total}",
  markSuffixSingular: "punto",
  markSuffixPlural: "puntos",
  previous: "Anterior",
  next: "Siguiente",
  submit: "Enviar respuestas",
  submitting: "Calificando…",
  unansweredWarning: "Tienes preguntas sin responder.",
  timeLeft: "Tiempo restante",
  timeUp: "Se acabó el tiempo, enviando…",
  trueLabel: "Verdadero",
  falseLabel: "Falso",
  chooseOne: "Elige una opción",
  chooseMany: "Elige todas las que correspondan",
  orderInstruction: "Ordena los elementos",
  matchInstruction: "Relaciona cada elemento",
  matchPlaceholder: "Elige…",
  fillPlaceholder: "Respuesta",
  moveUp: "Subir",
  moveDown: "Bajar",
  dragToReorder: "Arrastra para reordenar",
  attemptsUsedLabel: "Intento {used} de {max}",
  unlimitedAttempts: "Intentos ilimitados",
  introHeading: "¿Listo para comenzar?",
  startCta: "Comenzar quiz",
  questionsCountLabel: "{n} preguntas",
  timeLimitLabel: "Tiempo límite: {time}",
  attemptsRemainingLabel: "{n} intentos restantes",
  noAttemptsTitle: "Ya usaste todos tus intentos",
  noAttemptsBody: "Este quiz permite {max} intentos y ya los completaste.",
  resultTitle: "Resultado",
  passedHeading: "¡Aprobaste!",
  failedHeading: "No alcanzaste el mínimo",
  scoreLabel: "Puntuación",
  correctLabel: "{n} de {total} correctas",
  excludedNote: "{n} preguntas no calificadas",
  passingGradeLabel: "Mínimo para aprobar",
  reviewTitle: "Revisión",
  correctBadge: "Correcta",
  incorrectBadge: "Incorrecta",
  excludedBadge: "No calificada",
  explanationLabel: "Explicación",
  retryCta: "Intentar de nuevo",
  backToCourseCta: "Volver al curso",
  noAttemptsLeft: "No te quedan intentos.",
  emptyTitle: "Este quiz no tiene preguntas todavía",
  emptyDescription: "Vuelve más tarde cuando el instructor lo complete.",
}

export const quizPageLabels: Record<"es" | "en", QuizPageLabels> = {
  es: defaultQuizPageLabels,
  en: {
    questionCounter: "{n} of {total}",
    markSuffixSingular: "point",
    markSuffixPlural: "points",
    previous: "Previous",
    next: "Next",
    submit: "Submit answers",
    submitting: "Grading…",
    unansweredWarning: "You have unanswered questions.",
    timeLeft: "Time left",
    timeUp: "Time's up, submitting…",
    trueLabel: "True",
    falseLabel: "False",
    chooseOne: "Choose one option",
    chooseMany: "Choose all that apply",
    orderInstruction: "Put the items in order",
    matchInstruction: "Match each item",
    matchPlaceholder: "Choose…",
    fillPlaceholder: "Answer",
    moveUp: "Move up",
    moveDown: "Move down",
    dragToReorder: "Drag to reorder",
    attemptsUsedLabel: "Attempt {used} of {max}",
    unlimitedAttempts: "Unlimited attempts",
    introHeading: "Ready to start?",
    startCta: "Start quiz",
    questionsCountLabel: "{n} questions",
    timeLimitLabel: "Time limit: {time}",
    attemptsRemainingLabel: "{n} attempts remaining",
    noAttemptsTitle: "You've used all your attempts",
    noAttemptsBody:
      "This quiz allows {max} attempts and you've completed them all.",
    resultTitle: "Result",
    passedHeading: "You passed!",
    failedHeading: "You didn't reach the minimum",
    scoreLabel: "Score",
    correctLabel: "{n} of {total} correct",
    excludedNote: "{n} questions not graded",
    passingGradeLabel: "Passing grade",
    reviewTitle: "Review",
    correctBadge: "Correct",
    incorrectBadge: "Incorrect",
    excludedBadge: "Not graded",
    explanationLabel: "Explanation",
    retryCta: "Try again",
    backToCourseCta: "Back to course",
    noAttemptsLeft: "You have no attempts left.",
    emptyTitle: "This quiz has no questions yet",
    emptyDescription: "Check back later once the instructor completes it.",
  },
}
