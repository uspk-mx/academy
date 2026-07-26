import { getCompanyTeam } from "@academy/courses-api/graphql/student-app/queries/company"
import {
  StudentBusinessTeamPage,
  type BusinessTeamMemberRow,
} from "@academy/student-ui/components/pages/business-team-page"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { useParams } from "react-router"
import { requireCompany } from "~/../lib/business"
import type { Route } from "./+types/team"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

const PAGE_SIZE = 20

export function meta() {
  return [
    { title: "Uspk Academy | Mi Equipo" },
    { name: "description", content: "Progreso de los miembros de tu equipo." },
  ]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { companyId, userId } = await requireCompany(request, params.lang)

  const url = new URL(request.url)
  const query = url.searchParams.get("q")?.trim() ?? ""
  const page = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1
  )

  const result = await getCompanyTeam(request, {
    companyId,
    search: query || null,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  const data = result?.companyTeamMembers

  const members: BusinessTeamMemberRow[] = (data?.members ?? []).map(
    (member) => ({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      role: member.role ?? null,
      occupation: member.occupation ?? null,
      profilePicture: member.profilePicture ?? null,
      isActive: Boolean(member.isActive),
      coursesInProgress: member.coursesInProgress,
      coursesCompleted: member.coursesCompleted,
      certificatesEarned: member.certificatesEarned,
      avgProgress: member.avgProgress,
      lastActivityAt: member.lastActivityAt ?? null,
    })
  )

  return { members, total: data?.total ?? 0, page, query, currentUserId: userId }
}

export default function Team({ loaderData }: Route.ComponentProps) {
  const { members, total, page, query, currentUserId } = loaderData
  const { lang } = useParams()

  return (
    <StudentBusinessTeamPage
      members={members}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      query={query}
      currentUserId={currentUserId}
      basePath={`/${lang}/dashboard/team`}
    />
  )
}
