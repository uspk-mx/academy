import { getMe } from "@academy/courses-api/graphql/queries/me"
import { redirect } from "react-router"

/** Roles allowed into the back office. Mirrors the API's own guards, which let
 *  instructors through on the course/curriculum resolvers while reserving
 *  taxonomy, billing and company management for admins. */
export const STAFF_ROLES = ["admin", "instructor"] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role)
}

/**
 * Gate for every authenticated admin route. Anonymous visitors and signed-in
 * non-staff users are both sent to the admin login with a `redirect` back to
 * where they were headed.
 *
 * `pathname` is taken from the URL rather than the raw request path because
 * React Router fetches "<path>.data" for client navigations — without stripping
 * that suffix the visitor would be bounced to an internal data URL after login.
 */
export async function adminAuthMiddleware({ request }: any, next: any) {
  const me = await getMe(request)

  if (!isStaffRole(me?.me?.role)) {
    const url = new URL(request.url)
    const pathname = url.pathname.replace(/\.data$/, "")
    const returnTo = `${pathname}${url.search}`
    throw redirect(`/login?redirect=${encodeURIComponent(returnTo)}`)
  }

  return next()
}

/** Only admins may manage taxonomy, plans and companies. */
export async function adminOnlyMiddleware({ request }: any, next: any) {
  const me = await getMe(request)

  if (me?.me?.role !== "admin") {
    throw redirect("/courses")
  }

  return next()
}
