import { getEnrollments } from "@academy/courses-api/graphql/student-app/queries/enrollments"
import { startCourseProgress } from "@academy/courses-api/graphql/student-app/mutations/progress"
import { StudentCoursesPage } from "@academy/student-ui/components/pages/courses-page"
import {
  defaultCoursesPageLabels,
  type StudentCourseCardItem,
} from "@academy/student-ui/types/courses"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { data, redirect, useFetcher, useParams } from "react-router"
import { getCourseUrl } from "~/../lib/course-utils"
import type { Route } from "./+types/courses"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Cursos" },
    { name: "description", content: "Lista de cursos del estudiante." },
  ]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const enrollments = await getEnrollments(request)

  // No enrollments is a valid empty state, not a 404.
  const rows = enrollments?.getUserEnrollments ?? []

  const items: StudentCourseCardItem[] = rows.flatMap((enrollment) => {
    const course = enrollment.course
    if (!course) return []

    const progressPercentage = course.progress?.progressPercentage ?? 0
    return [
      {
        id: enrollment.id,
        courseId: course.id,
        title: course.title,
        imageUrl: course.featuredImage,
        progressPercentage,
        // `startedAt` is an empty string (not null) before the first visit.
        isStarted: Boolean(course.progress?.startedAt) || progressPercentage > 0,
        isUnlocked: course.isUnlocked !== false,
        hasCertificate: (course.certificates?.length ?? 0) > 0,
        durationMinutes: course.duration ?? 0,
        instructors:
          course.instructors?.flatMap((i) => (i?.fullName ? [i.fullName] : [])) ??
          [],
        prerequisiteTitles:
          course.prerequisites?.flatMap((p) => (p?.title ? [p.title] : [])) ??
          [],
        href: getCourseUrl({ course }, params.lang),
        createdAt: course.createdAt ?? "",
      },
    ]
  })

  return {
    items,
    // TODO(hygraph): swap for a StudentCoursesPage model, same pattern as the
    // marketing loaders (defaults keep the page working meanwhile).
    labels: defaultCoursesPageLabels,
  }
}

/**
 * Records the first-visit progress row, then redirects into the course. Doing
 * it here (rather than firing the mutation alongside a client-side link) means
 * the player never loads before its progress exists.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const courseId = String(formData.get("courseId") ?? "")
  const redirectTo = String(formData.get("redirectTo") ?? "")

  if (!courseId || !redirectTo) {
    return data({ error: "missingCourse" as const }, { status: 400 })
  }

  const { setCookies } = await startCourseProgress({
    request,
    variables: { input: { courseId } },
  })

  const headers = new Headers()
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
  return redirect(redirectTo, { headers })
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const { items, labels } = loaderData
  const { lang } = useParams()
  const fetcher = useFetcher<typeof action>()

  const startingCourseId =
    fetcher.state !== "idle"
      ? String(fetcher.formData?.get("courseId") ?? "")
      : null

  return (
    <StudentCoursesPage
      items={items}
      labels={labels}
      exploreHref={`/${lang}/dashboard/explore`}
      startingCourseId={startingCourseId}
      onStartCourse={(courseId, href) =>
        fetcher.submit({ courseId, redirectTo: href }, { method: "post" })
      }
    />
  )
}
