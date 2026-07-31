import { getMe } from "@academy/courses-api/graphql/queries/me"
import { getCookie } from "@academy/courses-api/utils"
import { AdminShell } from "@academy/admin-ui/components/shell/admin-shell"
import { adminAuthMiddleware } from "@academy/admin-ui/middleware/auth"
import type { AdminUser } from "@academy/admin-ui/types/shell"
import { Outlet, useSubmit } from "react-router"
import type { Route } from "./+types/layout"

export const middleware = [adminAuthMiddleware]

export async function loader({ request }: Route.LoaderArgs) {
  // The middleware already proved this resolves to a staff user.
  const me = await getMe(request)
  const account = me!.me!

  const user: AdminUser = {
    id: account.customerId,
    fullName: account.fullName,
    email: account.email,
    role: account.role ?? "instructor",
    profilePicture: account.profilePicture ?? null,
  }

  // Matches the cookie the sidebar primitive writes on toggle.
  const sidebarState = await getCookie(request, "sidebar_state")

  return { user, sidebarOpen: sidebarState !== "false" }
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user, sidebarOpen } = loaderData
  const submit = useSubmit()

  return (
    <AdminShell
      user={user}
      sidebarOpen={sidebarOpen}
      onLogout={() => submit(null, { method: "post", action: "/logout" })}
    >
      <Outlet />
    </AdminShell>
  )
}
