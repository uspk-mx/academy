import { getMe } from "@academy/courses-api/graphql/queries/me"
import { redirect } from "react-router"

/**
 * Gate for company-admin routes (team, reports). Returns the admin's company id
 * and user id (`customerId`, which matches team-member ids for the "you" badge),
 * or bounces anyone who isn't a `business` user back to their learner dashboard
 * — so these surfaces never 404 or leak for regular students.
 */
export async function requireCompany(
  request: Request,
  lang: string
): Promise<{ companyId: string; userId: string }> {
  const me = await getMe(request)
  const user = me?.me
  if (user?.role === "business" && user.company?.id) {
    return { companyId: user.company.id, userId: user.customerId }
  }
  throw redirect(`/${lang}/dashboard`)
}
