/**
 * Presentational contract for the quiz attempts page. The route maps
 * `myQuizAttempts` onto `StudentQuizAttempt`; the page never touches GraphQL.
 *
 * Note what the API does NOT store: which individual answers were right or
 * wrong, and how long an attempt took. Only the total score is persisted, so
 * there is no correct/incorrect breakdown or duration to show here.
 */

export interface StudentQuizAttempt {
  id: string
  quizTitle: string
  courseId: string
  courseTitle: string
  /** ISO — rendered with Intl in the component. */
  attemptedAt: string
  /** Marks earned; the API's `score` is marks, not a percentage. */
  earnedMarks: number
  /** Sum of every question's mark. 0 when the quiz has no questions. */
  totalMarks: number
  /** 0–100, rounded. */
  percentage: number
  /** Percentage needed to pass. */
  passingGrade: number
  passed: boolean
  questionCount: number
  /** 1-based, counting from the oldest attempt of that quiz. */
  attemptNumber: number
  /** null when the quiz sets no limit. */
  maxAttempts: number | null
}

export type QuizAttemptFilter = "all" | "passed" | "failed"

export interface QuizAttemptsPageLabels {
  pageTitle: string
  totalSuffixSingular: string
  totalSuffixPlural: string
  passRateSuffix: string
  statsTotal: string
  statsPassed: string
  statsFailed: string
  statsPassRate: string
  statsAverage: string
  statsBest: string
  filterLabel: string
  filterAll: string
  filterPassed: string
  filterFailed: string
  resultsSingular: string
  resultsPlural: string
  passedBadge: string
  failedBadge: string
  scoreLabel: string
  marksLabel: string
  questionsLabel: string
  /** `{n}` is the attempt number, `{max}` the quiz's limit. */
  attemptNumberLabel: string
  attemptNumberOfLabel: string
  passingGradeLabel: string
  emptyTitle: string
  emptyDescription: string
  emptyCta: string
  noResultsTitle: string
  noResultsDescription: string
  clearFilterCta: string
}

export const defaultQuizAttemptsPageLabels: QuizAttemptsPageLabels = {
  pageTitle: "Mis Intentos de Quizzes",
  totalSuffixSingular: "intento",
  totalSuffixPlural: "intentos",
  passRateSuffix: "Tasa de aprobación",
  statsTotal: "Total",
  statsPassed: "Aprobados",
  statsFailed: "Reprobados",
  statsPassRate: "% Aprobación",
  statsAverage: "Promedio",
  statsBest: "Mejor score",
  filterLabel: "Filtrar:",
  filterAll: "Todos",
  filterPassed: "Aprobados",
  filterFailed: "Reprobados",
  resultsSingular: "resultado",
  resultsPlural: "resultados",
  passedBadge: "Aprobado",
  failedBadge: "Reprobado",
  scoreLabel: "Puntuación",
  marksLabel: "Calificación",
  questionsLabel: "Preguntas",
  attemptNumberLabel: "Intento {n}",
  attemptNumberOfLabel: "Intento {n} de {max}",
  passingGradeLabel: "Mínimo para aprobar",
  emptyTitle: "Sin intentos de quiz aún",
  emptyDescription:
    "Aún no has hecho ningún quiz. ¡Empieza a aprender y pon a prueba tus conocimientos!",
  emptyCta: "Ver mis cursos",
  noResultsTitle: "No hay intentos con ese filtro",
  noResultsDescription: "Intenta con otro filtro para ver más resultados.",
  clearFilterCta: "Ver todos",
}

export const quizAttemptsPageLabels: Record<
  "es" | "en",
  QuizAttemptsPageLabels
> = {
  es: defaultQuizAttemptsPageLabels,
  en: {
    pageTitle: "My Quiz Attempts",
    totalSuffixSingular: "attempt",
    totalSuffixPlural: "attempts",
    passRateSuffix: "Pass rate",
    statsTotal: "Total",
    statsPassed: "Passed",
    statsFailed: "Failed",
    statsPassRate: "Pass %",
    statsAverage: "Average",
    statsBest: "Best score",
    filterLabel: "Filter:",
    filterAll: "All",
    filterPassed: "Passed",
    filterFailed: "Failed",
    resultsSingular: "result",
    resultsPlural: "results",
    passedBadge: "Passed",
    failedBadge: "Failed",
    scoreLabel: "Score",
    marksLabel: "Grade",
    questionsLabel: "Questions",
    attemptNumberLabel: "Attempt {n}",
    attemptNumberOfLabel: "Attempt {n} of {max}",
    passingGradeLabel: "Passing grade",
    emptyTitle: "No quiz attempts yet",
    emptyDescription:
      "You haven't taken any quizzes yet. Start learning and test your knowledge!",
    emptyCta: "View my courses",
    noResultsTitle: "No attempts match that filter",
    noResultsDescription: "Try a different filter to see more results.",
    clearFilterCta: "View all",
  },
}
