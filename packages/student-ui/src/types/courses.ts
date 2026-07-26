/**
 * Presentational contract for the student courses page.
 *
 * The route maps `getUserEnrollments` onto `StudentCourseCardItem[]` (including
 * the resolved `href` via `getCourseUrl`), so this package never depends on
 * GraphQL result shapes.
 */

export interface StudentCourseCardItem {
  /** Enrollment id — stable key. */
  id: string
  courseId: string
  title: string
  imageUrl?: string | null
  /** 0–100. */
  progressPercentage: number
  /** Whether the learner has opened the course at least once. */
  isStarted: boolean
  isUnlocked: boolean
  hasCertificate: boolean
  /** Minutes. */
  durationMinutes: number
  instructors: string[]
  /** Titles of the courses that must be completed first. */
  prerequisiteTitles: string[]
  /** Deep-link to the first incomplete lesson/quiz. */
  href: string
  /** ISO — drives the newest/oldest sort. */
  createdAt: string
}

export type CourseFilter = "all" | "in_progress" | "completed" | "not_started"
export type CourseSort = "newest" | "oldest" | "a-z" | "z-a" | "progress"

export interface CourseCardLabels {
  completedBadge: string
  inProgressBadge: string
  lockedBadge: string
  /** "{courses}" is replaced with the prerequisite list. */
  lockedHint: string
  progressLabel: string
  /** "{duration}" is replaced with the formatted duration. */
  durationLabel: string
  completedNotice: string
  certificateAria: string
  reviewCta: string
  continueCta: string
  startCta: string
  lockedCta: string
}

export interface CoursesPageLabels {
  pageTitle: string
  /** "{n}" + singular/plural course noun. */
  totalSuffixSingular: string
  totalSuffixPlural: string
  statsInProgress: string
  statsCompleted: string
  statsNotStarted: string
  statsOverall: string
  searchPlaceholder: string
  searchAria: string
  filterAll: string
  filterInProgress: string
  filterCompleted: string
  filterNotStarted: string
  sortLabel: string
  sortNewest: string
  sortOldest: string
  sortAZ: string
  sortZA: string
  sortProgress: string
  resultsSingular: string
  resultsPlural: string
  noResultsTitle: string
  /** "{query}" is replaced with the search term. */
  noResultsWithQuery: string
  noResultsInCategory: string
  clearFiltersCta: string
  emptyTitle: string
  emptyDescription: string
  emptyCta: string
  paginationAria: string
  prevPageLabel: string
  nextPageLabel: string
  /** "{n}" is replaced with the page number. */
  pageLabel: string
  card: CourseCardLabels
}

export const defaultCoursesPageLabels: CoursesPageLabels = {
  pageTitle: "Mis Cursos",
  totalSuffixSingular: "curso en total",
  totalSuffixPlural: "cursos en total",
  statsInProgress: "En progreso",
  statsCompleted: "Completados",
  statsNotStarted: "Sin iniciar",
  statsOverall: "Progreso total",
  searchPlaceholder: "Buscar cursos por nombre...",
  searchAria: "Buscar cursos",
  filterAll: "Todos",
  filterInProgress: "En progreso",
  filterCompleted: "Completados",
  filterNotStarted: "Sin iniciar",
  sortLabel: "Ordenar:",
  sortNewest: "Más reciente",
  sortOldest: "Más antiguo",
  sortAZ: "A-Z",
  sortZA: "Z-A",
  sortProgress: "Mayor progreso",
  resultsSingular: "resultado",
  resultsPlural: "resultados",
  noResultsTitle: "No se encontraron cursos",
  noResultsWithQuery: 'No hay cursos que coincidan con "{query}"',
  noResultsInCategory: "No hay cursos en esta categoría",
  clearFiltersCta: "Limpiar filtros",
  emptyTitle: "Aún no tienes ningún curso",
  emptyDescription:
    "Explora nuestro catálogo y comienza tu viaje de aprendizaje",
  emptyCta: "Explorar Cursos",
  paginationAria: "Paginación",
  prevPageLabel: "Página anterior",
  nextPageLabel: "Página siguiente",
  pageLabel: "Página {n}",
  card: {
    completedBadge: "Completado",
    inProgressBadge: "En progreso",
    lockedBadge: "Curso bloqueado",
    lockedHint: "Completa primero: {courses}",
    progressLabel: "Progreso",
    durationLabel: "{duration} de duración",
    completedNotice: "¡Curso completado!",
    certificateAria: "Certificado obtenido",
    reviewCta: "Revisar curso",
    continueCta: "Continuar aprendiendo",
    startCta: "Iniciar curso",
    lockedCta: "Curso deshabilitado",
  },
}
