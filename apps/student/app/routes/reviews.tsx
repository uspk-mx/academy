import {
  createReview,
  deleteReview,
  updateReview,
} from "@academy/courses-api/graphql/student-app/mutations/reviews"
import { getUserProfile } from "@academy/courses-api/graphql/student-app/queries/users"
import { StudentReviewsPage } from "@academy/student-ui/components/pages/reviews-page"
import {
  reviewsPageLabels,
  type ReviewableCourse,
  type ReviewActionData,
  type StudentReview,
} from "@academy/student-ui/types/reviews"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { data, useParams } from "react-router"
import { pickLocale } from "@academy/user-ui/lib/lang"
import type { Route } from "./+types/reviews"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Reseñas" },
    {
      name: "description",
      content:
        "Reseñas de cursos de Uspk Academy, visualiza las reseñas que has escrito.",
    },
  ]
}

/**
 * Reviews hang off the enrolled courses in the profile payload, where the API
 * scopes them to the viewer. Flattening them here gives the page one list and
 * lets it carry the course title/image/instructor that `Review.course` (id and
 * title only) doesn't provide.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await getUserProfile(request)
  const courses = result?.getProfile?.courses ?? []

  // The API allows one review per course, so anything not reviewed yet is what
  // the "write a review" picker can offer.
  const reviewableCourses: ReviewableCourse[] = courses.flatMap((course) =>
    course && (course.reviews?.length ?? 0) === 0
      ? [{ id: course.id, title: course.title }]
      : []
  )

  const items: StudentReview[] = courses.flatMap((course) => {
    if (!course) return []
    const instructor = course.instructors?.find((i) => i?.fullName)?.fullName

    return (course.reviews ?? []).flatMap((review) => {
      if (!review) return []
      return [
        {
          id: review.id,
          courseId: course.id,
          courseTitle: course.title,
          courseImage: course.featuredImage || null,
          instructor: instructor ?? null,
          rating: review.rating ?? 0,
          comment: review.comment ?? "",
          likes: review.likes ?? 0,
          createdAt: review.createdAt ?? "",
        },
      ]
    })
  })

  // Newest first, matching the order the API returns them in per course.
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return {
    items,
    reviewableCourses,
    labels: pickLocale(params.lang, reviewsPageLabels),
  }
}

/**
 * One action for all three mutations, selected by `intent`. Ownership is
 * enforced by the API (update/delete are scoped to the caller in SQL), so there
 * is nothing to re-check here.
 *
 * Errors come back as CODES; the page maps them to labels.
 */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")

  const fail = (error: string, status = 400) =>
    data<ReviewActionData>({ error }, { status })

  try {
    if (intent === "delete") {
      const id = String(form.get("id") ?? "")
      if (!id) return fail("required")

      const { data: result, setCookies } = await deleteReview({
        request,
        variables: { id },
      })
      if (!result?.deleteReview) return fail("notFound", 404)
      return data<ReviewActionData>(
        { ok: true },
        { headers: cookies(setCookies) }
      )
    }

    const rating = Number(form.get("rating"))
    const comment = String(form.get("comment") ?? "").trim()

    if (!comment) return fail("required")
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail("ratingRange")
    }

    if (intent === "create") {
      const courseId = String(form.get("courseId") ?? "")
      if (!courseId) return fail("required")

      const { setCookies } = await createReview({
        request,
        variables: { input: { courseId, rating, comment } },
      })
      return data<ReviewActionData>(
        { ok: true },
        { headers: cookies(setCookies) }
      )
    }

    if (intent === "update") {
      const id = String(form.get("id") ?? "")
      if (!id) return fail("required")

      const { setCookies } = await updateReview({
        request,
        variables: { id, input: { rating, comment } },
      })
      return data<ReviewActionData>(
        { ok: true },
        { headers: cookies(setCookies) }
      )
    }

    return fail("generic")
  } catch (error) {
    // The API returns prose, not codes; match the two cases the UI can explain
    // and fall back to a generic message for everything else.
    const message = error instanceof Error ? error.message : ""
    if (message.includes("already reviewed"))
      return fail("alreadyReviewed", 409)
    if (message.includes("not found")) return fail("notFound", 404)

    console.error("[reviews] mutation failed:", error)
    return fail("generic", 500)
  }
}

function cookies(setCookies: string[]): Headers {
  const headers = new Headers()
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
  return headers
}

export default function Reviews({ loaderData }: Route.ComponentProps) {
  const { items, reviewableCourses, labels } = loaderData
  const { lang } = useParams()

  return (
    <StudentReviewsPage
      items={items}
      reviewableCourses={reviewableCourses}
      labels={labels}
      coursesHref={`/${lang}/dashboard/courses`}
    />
  )
}
