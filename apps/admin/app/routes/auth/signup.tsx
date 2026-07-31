import { redirect } from "react-router"
import type { Route } from "./+types/signup"

/**
 * The old admin app exposed an open /signup. Staff accounts are provisioned by
 * invitation now, so this only forwards: with a token the invite screen handles
 * it, without one there is nothing to sign up for.
 */
export function loader({ request }: Route.LoaderArgs) {
  const token = new URL(request.url).searchParams.get("token")
  return redirect(token ? `/invite?token=${encodeURIComponent(token)}` : "/login")
}
