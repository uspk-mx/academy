/**
 * Structural (not query-bound) input: the single-course query and the
 * enrollments query select different course fields, and this only needs ids,
 * positions and progress — so it accepts anything shaped like a course.
 */
interface CourseUrlItem {
  id: string
  position?: number | null
  progress?: { completed?: boolean | null } | null
}

export interface CourseUrlInput {
  course: {
    id: string
    topics?: ReadonlyArray<{
      position?: number | null
      lessons?: ReadonlyArray<CourseUrlItem | null> | null
      quizzes?: ReadonlyArray<CourseUrlItem | null> | null
    } | null> | null
  }
}

/**
 * Deep-link to the first incomplete lesson/quiz, falling back to the course.
 * Player routes live at `/:lang/courses/:cid/...` — outside the dashboard
 * shell, matching the old app's dedicated course layout.
 */
export function getCourseUrl({ course }: CourseUrlInput, lang: string) {
  const topics = [...(course.topics ?? [])].sort(
    (a, b) => (a?.position ?? 0) - (b?.position ?? 0)
  )

  const items: Array<{
    type: "lesson" | "quiz"
    id: string
    position: number
    progress?: { completed?: boolean | null } | null
  }> = []

  topics.forEach((topic) => {
    const topicItems = [
      ...(topic?.lessons ?? []).flatMap((lesson) =>
        lesson
          ? [
              {
                type: "lesson" as const,
                id: lesson.id,
                position: lesson.position ?? 0,
                progress: lesson.progress,
              },
            ]
          : []
      ),
      ...(topic?.quizzes ?? []).flatMap((quiz) =>
        quiz
          ? [
              {
                type: "quiz" as const,
                id: quiz.id,
                position: quiz.position ?? 0,
                progress: quiz.progress,
              },
            ]
          : []
      ),
    ]
    topicItems.sort((a, b) => a.position - b.position)
    items.push(...topicItems)
  })

  const firstIncomplete = items.find((item) => !item.progress?.completed)
  const target = firstIncomplete ?? items[0]

  const base = `/${lang}/courses/${course.id}`
  if (!target) return base

  return target.type === "quiz"
    ? `${base}/quiz/${target.id}`
    : `${base}/lesson/${target.id}`
}
