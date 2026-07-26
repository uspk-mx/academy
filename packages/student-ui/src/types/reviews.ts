/**
 * Presentational contract for the student reviews page. The route flattens
 * `getProfile.courses[].reviews` onto `StudentReview`; the page never touches
 * GraphQL.
 *
 * On the `getProfile` payload `Course.reviews` is scoped to the viewer, so
 * every item here is a review the student wrote.
 */

export interface StudentReview {
  id: string
  courseId: string
  courseTitle: string
  courseImage: string | null
  /** First instructor of the reviewed course, when the course has one. */
  instructor: string | null
  /** 1–5, enforced by a DB check constraint. */
  rating: number
  comment: string
  likes: number
  /** ISO — rendered with Intl in the component. */
  createdAt: string
}

export type ReviewRatingFilter = "all" | "5" | "4" | "3" | "2" | "1"

/** An enrolled course the student hasn't reviewed yet. */
export interface ReviewableCourse {
  id: string
  title: string
}

/** Actions return CODES (keys of `ReviewErrorLabels`), never raw copy. */
export interface ReviewActionData {
  ok?: boolean
  error?: string
}

export interface ReviewErrorLabels {
  required: string
  ratingRange: string
  alreadyReviewed: string
  notFound: string
  generic: string
}

export interface ReviewsPageLabels {
  pageTitle: string
  totalSuffixSingular: string
  totalSuffixPlural: string
  averageSuffix: string
  statsTotal: string
  statsAverage: string
  statsFiveStars: string
  statsFourStars: string
  filterLabel: string
  filterAll: string
  /** `{n}` is replaced with the star count. */
  filterStars: string
  resultsSingular: string
  resultsPlural: string
  ratingAria: string
  likesSuffix: string
  emptyTitle: string
  emptyDescription: string
  emptyCta: string
  noResultsTitle: string
  noResultsDescription: string
  clearFilterCta: string
  /** CRUD */
  writeReviewCta: string
  editCta: string
  deleteCta: string
  createModalTitle: string
  editModalTitle: string
  deleteModalTitle: string
  courseFieldLabel: string
  coursePlaceholder: string
  ratingFieldLabel: string
  commentFieldLabel: string
  commentPlaceholder: string
  /** `{n}` and `{max}` are replaced with the character counts. */
  charCounter: string
  /** `{n}` is replaced with the star count. */
  starAria: string
  saveCta: string
  savingCta: string
  createCta: string
  cancelCta: string
  confirmDeleteCta: string
  /** `{course}` is replaced with the course title. */
  deleteConfirmation: string
  allCoursesReviewed: string
  errors: ReviewErrorLabels
}

/** Matches the API's `text` column; the DB itself sets no limit. */
export const REVIEW_COMMENT_MAX_LENGTH = 500

export const defaultReviewsPageLabels: ReviewsPageLabels = {
  pageTitle: "Mis Reseñas",
  totalSuffixSingular: "reseña",
  totalSuffixPlural: "reseñas",
  averageSuffix: "Promedio",
  statsTotal: "Total",
  statsAverage: "Promedio",
  statsFiveStars: "5 Estrellas",
  statsFourStars: "4 Estrellas",
  filterLabel: "Filtrar:",
  filterAll: "Todas",
  filterStars: "{n} ⭐",
  resultsSingular: "resultado",
  resultsPlural: "resultados",
  ratingAria: "Calificación: {n} de 5",
  likesSuffix: "útiles",
  emptyTitle: "Aún no has dejado ninguna reseña",
  emptyDescription:
    "¡Comparte tus ideas sobre los cursos que has tomado para ayudar a otros estudiantes!",
  emptyCta: "Ver mis cursos",
  noResultsTitle: "No hay reseñas con esa calificación",
  noResultsDescription: "Intenta con otro filtro para ver más reseñas.",
  clearFilterCta: "Ver todas",
  writeReviewCta: "Escribir reseña",
  editCta: "Editar",
  deleteCta: "Eliminar",
  createModalTitle: "Nueva reseña",
  editModalTitle: "Editar reseña",
  deleteModalTitle: "Eliminar reseña",
  courseFieldLabel: "Curso",
  coursePlaceholder: "Selecciona un curso",
  ratingFieldLabel: "Calificación",
  commentFieldLabel: "Tu reseña",
  commentPlaceholder: "Comparte tu experiencia con este curso…",
  charCounter: "{n}/{max}",
  starAria: "{n} estrellas",
  saveCta: "Guardar cambios",
  savingCta: "Guardando…",
  createCta: "Publicar reseña",
  cancelCta: "Cancelar",
  confirmDeleteCta: "Eliminar reseña",
  deleteConfirmation:
    "¿Seguro que quieres eliminar tu reseña de «{course}»? Esta acción no se puede deshacer.",
  allCoursesReviewed: "Ya reseñaste todos tus cursos.",
  errors: {
    required: "Completa todos los campos.",
    ratingRange: "La calificación debe estar entre 1 y 5.",
    alreadyReviewed: "Ya escribiste una reseña para este curso.",
    notFound: "No encontramos esa reseña.",
    generic: "Algo salió mal. Inténtalo de nuevo más tarde.",
  },
}
