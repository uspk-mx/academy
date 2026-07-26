import {
  markLessonCompleted,
  revertLessonProgress,
} from "@academy/courses-api/graphql/student-app/mutations/progress"
import { getStudentCourse } from "@academy/courses-api/graphql/student-app/queries/courses"
import { getPracticeBitesByLesson } from "@academy/courses-api/graphql/student-app/queries/practice-bites"
import { StudentLessonPage } from "@academy/student-ui/components/pages/lesson-page"
import { StudentPracticeBites } from "@academy/student-ui/components/practice-bites/practice-bites"
import {
  defaultCourseViewerLabels,
  type LessonView,
} from "@academy/student-ui/types/course-viewer"
import {
  defaultPracticeBitesLabels,
  type PracticeBiteItemType,
  type PracticeBiteView,
} from "@academy/student-ui/types/practice-bites"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { useState } from "react"
import { data, redirect, useFetcher, useParams } from "react-router"
import type { action as practiceBiteAction } from "../../practice-bite"
import type { PostHogContext } from "../../../lib/posthog-middleware"
import { hasCourseCertificate } from "~/../lib/certificate"
import {
  attachmentFilename,
  buildCourseOutline,
  findNeighbours,
} from "~/../lib/course-outline"
import { sanitizeLessonHtml } from "~/../lib/lesson-html"
import type { Route } from "./+types/lesson"

const PRACTICE_ITEM_TYPES: PracticeBiteItemType[] = [
  "TRUE_FALSE",
  "IMAGE_SHORT_PHRASE",
  "FILL_IN_THE_BLANKS",
  "MATCHING_4_COLUMN",
]

function toPracticeItemType(value: string): PracticeBiteItemType {
  return PRACTICE_ITEM_TYPES.includes(value as PracticeBiteItemType)
    ? (value as PracticeBiteItemType)
    : "TRUE_FALSE"
}

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.lesson?.title
  return [
    { title: title ? `Uspk Academy | ${title}` : "Uspk Academy | Lección" },
    {
      name: "description",
      content: loaderData?.outline?.courseTitle ?? "Lección del curso.",
    },
  ]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const [result, practiceResult, hasCertificate] = await Promise.all([
    getStudentCourse({ request, variables: { courseId: params.cid } }),
    getPracticeBitesByLesson(request, params.lessonId),
    hasCourseCertificate(request, params.cid),
  ])
  const course = result?.course
  if (!course) throw new Response("Not Found", { status: 404 })

  // Entitlement guard (defense in depth). The API already strips lesson video
  // URLs for users without access, but a non-entitled student shouldn't sit in
  // the viewer at all — bounce them to their course list.
  if (!course.hasAccess) throw redirect(`/${params.lang}/dashboard/courses`)

  const outline = buildCourseOutline(course, params.lang)

  const rawLesson = (course.topics ?? [])
    .flatMap((topic) => topic?.lessons ?? [])
    .find((lesson) => lesson?.id === params.lessonId)

  // A lesson id that isn't in this course is a 404, not an empty page.
  if (!rawLesson) throw new Response("Not Found", { status: 404 })

  const videoUrl = rawLesson.video?.videoURL ?? ""
  const lesson: LessonView = {
    id: rawLesson.id,
    title: rawLesson.title,
    // Sanitized here so the browser never receives the raw editor HTML.
    content: sanitizeLessonHtml(rawLesson.content ?? ""),
    completed: Boolean(rawLesson.progress?.completed),
    // The API has stored the string "undefined" for missing videos.
    video:
      videoUrl && videoUrl !== "undefined"
        ? {
            src: videoUrl,
            format: rawLesson.video?.format || "mp4",
            durationSeconds: rawLesson.video?.duration ?? 0,
          }
        : null,
    attachments: (rawLesson.attachments ?? []).flatMap((url) =>
      url ? [{ url, filename: attachmentFilename(url) }] : []
    ),
  }

  // Learner-safe: settings carry no answer key, and the query never selected
  // `solution`. The first bite is the one shown (a lesson has at most one today).
  const rawBite = practiceResult?.practiceBitesByLessonId?.[0]
  const practiceBite: PracticeBiteView | null =
    rawBite && (rawBite.items?.length ?? 0) > 0
      ? {
          id: rawBite.id,
          title: rawBite.title,
          description: rawBite.description ?? null,
          attempts: rawBite.progress?.attempts ?? 0,
          completed: Boolean(rawBite.progress?.completed),
          items: [...(rawBite.items ?? [])]
            .flatMap((item) => (item ? [item] : []))
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((item) => ({
              id: item.id,
              type: toPracticeItemType(item.type),
              prompt: item.prompt,
              media: item.media || null,
              options: (item.settings?.options ?? []).filter(
                (v): v is string => v != null
              ),
              matchingColumns: (item.settings?.matchingColumns ?? []).map(
                (col) => (col.items ?? []).filter((v): v is string => v != null)
              ),
            })),
        }
      : null

  // The viewer only announces the certificate; the certificates page owns the
  // PDF. Gated on the credential's existence (the authoritative completion
  // signal) rather than the course.progress field, which comes back null here.
  const certificateHref = hasCertificate
    ? `/${params.lang}/dashboard/certificates?course=${params.cid}`
    : null

  return {
    outline,
    lesson,
    practiceBite,
    certificateHref,
    ...findNeighbours(outline, lesson.id),
    // TODO(hygraph): swap for a CourseViewer model, same pattern as the
    // marketing loaders (defaults keep the page working meanwhile).
    labels: defaultCourseViewerLabels,
  }
}

/**
 * Toggles lesson completion. Both mutations recalculate course progress
 * server-side, so the loader revalidation that follows shows the corrected
 * counters without any client-side bookkeeping.
 */
export async function action({ request, params, context }: Route.ActionArgs) {
  const form = await request.formData()
  const lessonId = String(form.get("lessonId") ?? "")
  const completed = String(form.get("completed") ?? "") === "true"

  if (!lessonId) return data({ error: "missingLesson" }, { status: 400 })

  try {
    const { setCookies } = completed
      ? await revertLessonProgress({ request, variables: { lessonId } })
      : await markLessonCompleted({ request, variables: { input: { lessonId } } })

    // Engagement signal: only when marking complete, not when reverting.
    if (!completed) {
      const posthog = (context as PostHogContext).posthog
      posthog?.capture({
        event: "lesson_completed",
        properties: { lesson_id: lessonId, course_id: params.cid },
      })
    }

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return data({ ok: true }, { headers })
  } catch (error) {
    console.error("[lesson] completion toggle failed:", error)
    return data({ error: "generic" }, { status: 500 })
  }
}

export default function Lesson({ loaderData }: Route.ComponentProps) {
  const {
    outline,
    lesson,
    practiceBite,
    certificateHref,
    previousHref,
    nextHref,
    labels,
  } = loaderData
  const { lang } = useParams()
  const fetcher = useFetcher()

  const toggleComplete = () =>
    fetcher.submit(
      { lessonId: lesson.id, completed: String(lesson.completed) },
      { method: "post" }
    )

  return (
    <StudentLessonPage
      outline={outline}
      lesson={lesson}
      labels={labels}
      coursesHref={`/${lang}/dashboard/courses`}
      previousHref={previousHref}
      nextHref={nextHref}
      isSavingCompletion={fetcher.state !== "idle"}
      certificateHref={certificateHref}
      onToggleComplete={toggleComplete}
      // Finishing the video marks the lesson done, but never un-marks it.
      onVideoEnded={() => {
        if (!lesson.completed && fetcher.state === "idle") toggleComplete()
      }}
      practiceBites={
        practiceBite ? (
          <PracticeBitesSection lang={lang ?? "es"} bite={practiceBite} />
        ) : null
      }
    />
  )
}

/**
 * Wires the practice-bite widget to the standalone submit route. Bumping the key
 * on retry remounts the runner with a fresh fetcher, clearing the previous
 * result and all draft answers.
 */
function PracticeBitesSection({
  lang,
  bite,
}: {
  lang: string
  bite: PracticeBiteView
}) {
  const [attemptKey, setAttemptKey] = useState(0)
  return (
    <PracticeBitesRunner
      key={attemptKey}
      lang={lang}
      bite={bite}
      onRetry={() => setAttemptKey((k) => k + 1)}
    />
  )
}

function PracticeBitesRunner({
  lang,
  bite,
  onRetry,
}: {
  lang: string
  bite: PracticeBiteView
  onRetry: () => void
}) {
  const fetcher = useFetcher<typeof practiceBiteAction>()
  const result =
    fetcher.data && "result" in fetcher.data ? fetcher.data.result : null

  return (
    <StudentPracticeBites
      bite={bite}
      labels={defaultPracticeBitesLabels}
      result={result}
      isSubmitting={fetcher.state !== "idle"}
      onSubmit={(payload) =>
        fetcher.submit(
          { payload: JSON.stringify(payload) },
          { method: "post", action: `/${lang}/practice-bite` }
        )
      }
      onRetry={onRetry}
    />
  )
}
