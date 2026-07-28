import { getCourses } from "@academy/courses-api/graphql/queries/courses"
import type { Route } from "./+types/search"

export async function loader({ request }: Route.LoaderArgs) {
  const term = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (term.length < 2) return { courses: [] }

  try {
    const data = await getCourses({
      request,
      variables: { search: term, limit: 6 },
    })
    const courses = (data?.courses?.course ?? []).map((course) => ({
      id: course.id,
      title: course.title ?? "",
      slug: course.slug ?? "",
    }))
    return { courses }
  } catch {
    return { courses: [] }
  }
}
