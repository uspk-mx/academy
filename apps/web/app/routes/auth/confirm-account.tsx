import { loadAuthLabels } from "@academy/cms/loaders/auth"
import { confirmAccountMutation } from "@academy/courses-api/graphql/mutations/auth"
import { ConfirmAccountPage } from "@academy/user-ui/components/pages/auth/confirm-account"
import { redirect } from "react-router"
import type { Route } from "./+types/confirm-account"

/**
 * Email-confirmation landing page. Reads `?token=`, confirms the account, and
 * redirects to login on success (with `?confirmed=1`). Any failure renders the
 * error state. Confirmation runs in the loader so the emailed link just works.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const labels = await loadAuthLabels(params.lang)
  const token = new URL(request.url).searchParams.get("token")
  if (!token) return { labels }

  try {
    const { data: result, setCookies } = await confirmAccountMutation(request, {
      token,
    })
    if (!result?.confirmAccount) return { labels }

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return redirect(`/${params.lang}/login?confirmed=1`, { headers })
  } catch {
    return { labels }
  }
}

export default function ConfirmAccountRoute({
  params,
  loaderData,
}: Route.ComponentProps) {
  const { labels } = loaderData
  return (
    <ConfirmAccountPage
      loginHref={`/${params.lang}/login`}
      labels={labels.confirm}
      shellLabels={labels.shell}
    />
  )
}
