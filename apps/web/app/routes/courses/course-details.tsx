import { loadCommonLabels } from "@academy/cms/loaders/common-labels"
import { loadCourseDetailsLabels } from "@academy/cms/loaders/course-details"
import {
  addToCartMutation,
  type AddToCartResult,
  type AddToCartVariables,
} from "@academy/courses-api/graphql/mutations/cart"
import { getCourseBySlug } from "@academy/courses-api/graphql/queries/course"
import { getCourses } from "@academy/courses-api/graphql/queries/courses"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import { CourseDetailPage } from "@academy/user-ui/components/pages/course-details-page"
import type { AuthState, EnrollmentStatus } from "@academy/user-ui/types/api"
import { data, useFetcher } from "react-router"
import type { Route } from "./+types/course-details"
import { getCart } from "@academy/courses-api/graphql/queries/cart"
import {
  createEnrollmentMutation,
  type CreateEnrollmentResult,
  type CreateEnrollmentVariables,
} from "@academy/courses-api/graphql/mutations/enrollments"
import type { PostHogContext } from "../../lib/posthog-middleware"

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const [{ courseBySlug }, { courses }, me, cart, labels, cardLabels] =
    await Promise.all([
      getCourseBySlug({ request, variables: { slug: params.id } }),
      getCourses({ request, variables: {} }),
      getMe(request),
      getCart(request),
      loadCourseDetailsLabels(params.lang),
      loadCommonLabels(params.lang),
    ])

  if (!courseBySlug) {
    throw new Response("Not Found", { status: 404 })
  }

  const posthog = (context as PostHogContext).posthog
  posthog?.capture({
    event: "course_viewed",
    properties: { course_id: courseBySlug.id, course_slug: params.id },
  })

  const user = me?.me
  const auth: AuthState = user
    ? {
        status: "authenticated",
        user: {
          id: user.customerId,
          name: user.fullName,
          email: user.email,
          avatarUrl: user.profilePicture ?? undefined,
        },
      }
    : { status: "anonymous" }

  // Enrollment is derived from the session's enrolled courses (me.courses),
  // the only per-user signal the API currently exposes for a course.
  const enrolled = user?.courses?.find((c) => c?.id === courseBySlug.id)
  const enrollment: EnrollmentStatus = !enrolled
    ? "none"
    : enrolled.progress?.completed
      ? "completed"
      : "enrolled"

  return {
    courseBySlug,
    courses,
    auth,
    enrollment,
    cart,
    userId: user?.customerId ?? "",
    labels: { ...labels, cardLabels },
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const courseId = formData.get("courseId")
  const userId = formData.get("userId")
  const intent = String(formData.get("intent") ?? "create")
  const posthog = (context as PostHogContext).posthog

  if (intent === "addToCart") {
    if (typeof courseId !== "string" || courseId.length === 0) {
      throw new Response("Course ID is required", { status: 400 })
    }

    const variables: AddToCartVariables = {
      input: { itemId: courseId, quantity: 1 },
    }
    const { addToCart, setCookies } = await addToCartMutation({
      request,
      variables,
    })
    const headers = new Headers()
    for (const c of setCookies) headers.append("Set-Cookie", c)

    posthog?.capture({
      event: "course_added_to_cart",
      properties: { course_id: courseId },
    })

    // The mutation returns the full cart; the dialog only needs the line that
    // was just added — pick it out by the item id we submitted.
    const addedItem =
      addToCart.items.find((line) => line.itemId === courseId) ?? null
    return data<AddToCartResult["addToCart"]["items"][number] | null>(
      addedItem,
      {
        headers,
      }
    )
  }

  if (intent === "enrollFree") {
    if (
      typeof courseId !== "string" ||
      courseId.length === 0 ||
      typeof userId !== "string"
    ) {
      throw new Response("course id and user id is required", { status: 400 })
    }

    const variables: CreateEnrollmentVariables = {
      courseId,
      userId,
    }
    const { data: enrrollment, setCookies } = await createEnrollmentMutation({
      request,
      variables,
    })
    const headers = new Headers()
    for (const c of setCookies) headers.append("Set-Cookie", c)

    posthog?.capture({
      event: "free_course_enrolled",
      properties: { course_id: courseId, user_id: userId },
    })

    return data<CreateEnrollmentResult | undefined>(enrrollment, {
      headers,
    })
  }
}

export default function CourseDetails({ loaderData }: Route.ComponentProps) {
  const {
    courses,
    courseBySlug: course,
    auth,
    enrollment,
    cart,
    userId,
    labels,
  } = loaderData
  // One route action serves both intents, so `fetcher.data` is a union —
  // narrow with `in` checks at each use site instead of forcing generics.
  const addToCartFetcher = useFetcher<typeof action>()
  const enrollFreeCourse = useFetcher<typeof action>()

  return (
    <CourseDetailPage
      labels={labels}
      course={course}
      enrolledCourse={
        enrollFreeCourse.data && "createEnrollment" in enrollFreeCourse.data
          ? enrollFreeCourse.data
          : undefined
      }
      relatedCourses={courses.course.filter((c) => c.id !== course.id)}
      auth={auth}
      enrollment={enrollment}
      onBuyNow={(id) => console.log("buy now", id)}
      onAddToCart={(courseId) =>
        addToCartFetcher.submit(
          { courseId, intent: "addToCart" },
          { method: "post" }
        )
      }
      cart={cart}
      isAddingItem={
        addToCartFetcher.state === "loading" ||
        enrollFreeCourse.state === "loading"
      }
      onEnrollFree={(courseId) =>
        enrollFreeCourse.submit(
          { courseId, userId, intent: "enrollFree" },
          { method: "post" }
        )
      }
      addedItem={
        addToCartFetcher.state !== "loading" &&
        addToCartFetcher.data &&
        "itemId" in addToCartFetcher.data
          ? addToCartFetcher.data
          : undefined
      }
    />
  )
}
