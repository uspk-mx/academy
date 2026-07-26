import { logoutMutation } from "@academy/courses-api/graphql/mutations/auth"
import { redirect } from "react-router"
import type { Route } from "./+types/logout"

export async function action({ request, params }: Route.ActionArgs) {
  const { setCookies } = await logoutMutation(request)

  const headers = new Headers()
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
  return redirect(`/${params.lang}/dashboard`, { headers })
}

// Hitting /logout directly (GET) just bounces back to the dashboard.
export function loader({ params }: Route.LoaderArgs) {
  return redirect(`/${params.lang}/dashboard`)
}
