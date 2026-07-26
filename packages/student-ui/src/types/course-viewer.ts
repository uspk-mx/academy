/**
 * Presentational contract for the course viewer (lesson and, later, quiz).
 *
 * The route flattens `course.topics` into this shape once, so the sidebar,
 * the header and the prev/next controls all read the same ordered list — in
 * the old viewer each of those rebuilt its own list from the raw topics and
 * they could disagree about what "next" meant.
 */

export type CourseItemKind = "lesson" | "quiz"

export interface CourseItemRef {
  kind: CourseItemKind
  id: string
  title: string
  completed: boolean
  /** Lang-scoped route for this item. */
  href: string
}

export interface CourseTopicOutline {
  id: string
  title: string
  items: CourseItemRef[]
}

export interface CourseOutline {
  courseId: string
  courseTitle: string
  topics: CourseTopicOutline[]
  /** Flattened in display order — the source of truth for prev/next. */
  items: CourseItemRef[]
  completedCount: number
  totalCount: number
  progressPercentage: number
}

export interface LessonAttachment {
  url: string
  filename: string
}

export interface LessonVideo {
  src: string
  format: string
  durationSeconds: number
}

export interface LessonView {
  id: string
  title: string
  /** HTML from the CMS/editor. */
  content: string
  completed: boolean
  video: LessonVideo | null
  attachments: LessonAttachment[]
}

export interface CourseViewerLabels {
  backToCourses: string
  contentsTitle: string
  /** `{done}` / `{total}` are replaced with item counts. */
  progressSummary: string
  lessonLabel: string
  quizLabel: string
  previous: string
  next: string
  markComplete: string
  markedComplete: string
  savingComplete: string
  attachmentsTitle: string
  attachmentsEmpty: string
  downloadCta: string
  noVideo: string
  noContent: string
  completedBadge: string
  /** Sidebar footer, shown once the course is completed. */
  certificateReady: string
  viewCertificate: string
  video: VideoPlayerLabelsShape
}

/** Mirrors VideoPlayerLabels without importing the component into a types file. */
export interface VideoPlayerLabelsShape {
  play: string
  pause: string
  back10: string
  forward10: string
  mute: string
  unmute: string
  volume: string
  speed: string
  pictureInPicture: string
  fullscreen: string
  exitFullscreen: string
  loadError: string
}

export const defaultCourseViewerLabels: CourseViewerLabels = {
  backToCourses: "Mis cursos",
  contentsTitle: "Contenido del curso",
  progressSummary: "{done} de {total} completados",
  lessonLabel: "Lección",
  quizLabel: "Quiz",
  previous: "Anterior",
  next: "Siguiente",
  markComplete: "Marcar como completada",
  markedComplete: "Completada",
  savingComplete: "Guardando…",
  attachmentsTitle: "Materiales de la lección",
  attachmentsEmpty: "Esta lección no tiene materiales adicionales.",
  downloadCta: "Descargar",
  noVideo: "Esta lección no tiene video.",
  noContent: "Esta lección aún no tiene contenido.",
  completedBadge: "Completada",
  certificateReady: "¡Curso completado!",
  viewCertificate: "Ver certificado",
  video: {
    play: "Reproducir",
    pause: "Pausar",
    back10: "Retroceder 10 s",
    forward10: "Avanzar 10 s",
    mute: "Silenciar",
    unmute: "Activar sonido",
    volume: "Volumen",
    speed: "Velocidad",
    pictureInPicture: "Picture in picture",
    fullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa",
    loadError:
      "No pudimos cargar el video. Recarga la página o inténtalo más tarde.",
  },
}
