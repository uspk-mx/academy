import { getCompanyReports } from "@academy/courses-api/graphql/student-app/queries/company"
import {
  StudentBusinessReportsPage,
  type CourseProgressReport,
} from "@academy/student-ui/components/pages/business-reports-page"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { requireCompany } from "~/../lib/business"
import type { Route } from "./+types/reports"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Reportes" },
    {
      name: "description",
      content: "Progreso de tu equipo por curso en Uspk Academy.",
    },
  ]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { companyId } = await requireCompany(request, params.lang)

  const result = await getCompanyReports(request, companyId)

  const courses: CourseProgressReport[] = (
    result?.companyCourseProgressSummary ?? []
  ).flatMap((row) => {
    if (!row.course) return []
    return [
      {
        id: row.course.id,
        title: row.course.title,
        image: row.course.featuredImage ?? null,
        enrolled: row.enrolledCount,
        started: row.startedCount,
        completed: row.completedCount,
        avgProgress: row.avgProgressPercentage,
      },
    ]
  })

  return { courses }
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  return <StudentBusinessReportsPage courses={loaderData.courses} />
}
