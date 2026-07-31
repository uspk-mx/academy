import { logoutMutation } from "@academy/courses-api/graphql/mutations/auth"
import { redirect } from "react-router"
import type { Route } from "./+types/logout"
import type { PostHogContext } from "../../lib/posthog-middleware"

export async function action({ request, context }: Route.ActionArgs) {
  const posthog = (context as PostHogContext).posthog
  posthog?.capture({ event: "admin_logged_out" })

  const { setCookies } = await logoutMutation(request)

  const headers = new Headers()
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
  return redirect("/login", { headers })
}

// Hitting /logout directly (GET) just bounces to the login page.
export function loader() {
  return redirect("/login")
}
