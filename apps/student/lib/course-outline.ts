import type {
  CourseItemRef,
  CourseOutline,
  CourseTopicOutline,
} from "@academy/student-ui/types/course-viewer"

/**
 * Shape accepted from the API. Written structurally rather than importing the
 * generated type so the mapper doesn't churn every time the query selection
 * changes — only the fields actually used are named.
 */
export interface OutlineInput {
  id: string
  title: string
  topics?:
    | ({
        id: string
        title?: string | null
        position?: number | null
        lessons?:
          | ({
              id: string
              title: string
              position?: number | null
              progress?: { completed?: boolean | null } | null
            } | null)[]
          | null
        quizzes?:
          | ({
              id: string
              title: string
              position?: number | null
              progress?: { completed?: boolean | null } | null
            } | null)[]
          | null
      } | null)[]
    | null
}

/**
 * Flattens a course into the viewer's outline: topics in position order, and
 * within each topic lessons and quizzes interleaved by their own position.
 *
 * The flattened `items` list is what prev/next uses, so navigation and the
 * sidebar can never disagree about the order — in the old viewer each rebuilt
 * its own list.
 */
export function buildCourseOutline(
  course: OutlineInput,
  lang: string
): CourseOutline {
  const topics = [...(course.topics ?? [])]
    .flatMap((topic) => (topic ? [topic] : []))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  const outlineTopics: CourseTopicOutline[] = topics.map((topic) => {
    const lessons = (topic.lessons ?? []).flatMap((lesson) =>
      lesson
        ? [
            {
              kind: "lesson" as const,
              id: lesson.id,
              title: lesson.title,
              completed: Boolean(lesson.progress?.completed),
              position: lesson.position ?? 0,
              href: `/${lang}/courses/${course.id}/lesson/${lesson.id}`,
            },
          ]
        : []
    )

    const quizzes = (topic.quizzes ?? []).flatMap((quiz) =>
      quiz
        ? [
            {
              kind: "quiz" as const,
              id: quiz.id,
              title: quiz.title,
              completed: Boolean(quiz.progress?.completed),
              position: quiz.position ?? 0,
              href: `/${lang}/courses/${course.id}/quiz/${quiz.id}`,
            },
          ]
        : []
    )

    const items: CourseItemRef[] = [...lessons, ...quizzes]
      .sort((a, b) => a.position - b.position)
      .map(({ position: _position, ...item }) => item)

    return {
      id: topic.id,
      title: topic.title ?? "",
      items,
    }
  })

  const items = outlineTopics.flatMap((topic) => topic.items)
  const completedCount = items.filter((item) => item.completed).length

  return {
    courseId: course.id,
    courseTitle: course.title,
    topics: outlineTopics,
    items,
    completedCount,
    totalCount: items.length,
    progressPercentage:
      items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
  }
}

/** Neighbours of an item in the flattened order; null at either end. */
export function findNeighbours(
  outline: CourseOutline,
  itemId: string
): { previousHref: string | null; nextHref: string | null } {
  const index = outline.items.findIndex((item) => item.id === itemId)
  if (index === -1) return { previousHref: null, nextHref: null }
  return {
    previousHref: outline.items[index - 1]?.href ?? null,
    nextHref: outline.items[index + 1]?.href ?? null,
  }
}

/** Last path segment of a URL, used as an attachment's display name. */
export function attachmentFilename(url: string): string {
  try {
    const path = new URL(url).pathname
    return decodeURIComponent(path.split("/").pop() || url)
  } catch {
    return decodeURIComponent(url.split("/").pop() || url)
  }
}
