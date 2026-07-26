import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

/**
 * Overview for the business (company-admin) dashboard: team-wide stats plus a
 * short roster preview. The full team table and reports live on their own
 * routes; this is just the landing summary. Authorization is server-side — the
 * resolver only answers for a company the requester belongs to.
 */
export const COMPANY_DASHBOARD_QUERY = graphql(`
  query CompanyDashboard($companyId: ID!) {
    companyTeamStats(companyId: $companyId) {
      totalMembers
      activeMembers
      coursesInProgress
      coursesCompleted
      certificatesEarned
      avgProgressPercentage
    }
    companyTeamMembers(companyId: $companyId, filter: { limit: 5 }) {
      total
      members {
        id
        fullName
        email
        profilePicture
        coursesInProgress
        coursesCompleted
        avgProgress
        lastActivityAt
      }
    }
  }
`)

export type CompanyDashboardResult = ResultOf<typeof COMPANY_DASHBOARD_QUERY>
export type CompanyDashboardVariables = VariablesOf<
  typeof COMPANY_DASHBOARD_QUERY
>

export async function getCompanyDashboard(
  request: Request,
  companyId: string
): Promise<CompanyDashboardResult | null> {
  try {
    return await coursesApiClient(request, COMPANY_DASHBOARD_QUERY, {
      companyId,
    })
  } catch {
    return null
  }
}

/** Full, paginated team roster for the business Team page (server-side search). */
export const COMPANY_TEAM_QUERY = graphql(`
  query CompanyTeam(
    $companyId: ID!
    $search: String
    $limit: Int
    $offset: Int
  ) {
    companyTeamMembers(
      companyId: $companyId
      filter: { search: $search, limit: $limit, offset: $offset }
    ) {
      total
      members {
        id
        fullName
        email
        role
        occupation
        profilePicture
        isActive
        coursesInProgress
        coursesCompleted
        certificatesEarned
        avgProgress
        lastActivityAt
      }
    }
  }
`)

export type CompanyTeamResult = ResultOf<typeof COMPANY_TEAM_QUERY>
export type CompanyTeamVariables = VariablesOf<typeof COMPANY_TEAM_QUERY>

export async function getCompanyTeam(
  request: Request,
  variables: CompanyTeamVariables
): Promise<CompanyTeamResult | null> {
  try {
    return await coursesApiClient(request, COMPANY_TEAM_QUERY, variables)
  } catch {
    return null
  }
}

/** Per-course progress across the whole team, for the business Reports page. */
export const COMPANY_REPORTS_QUERY = graphql(`
  query CompanyReports($companyId: ID!) {
    companyCourseProgressSummary(companyId: $companyId) {
      course {
        id
        title
        featuredImage
      }
      enrolledCount
      startedCount
      completedCount
      avgProgressPercentage
    }
  }
`)

export type CompanyReportsResult = ResultOf<typeof COMPANY_REPORTS_QUERY>

export async function getCompanyReports(
  request: Request,
  companyId: string
): Promise<CompanyReportsResult | null> {
  try {
    return await coursesApiClient(request, COMPANY_REPORTS_QUERY, { companyId })
  } catch {
    return null
  }
}
