import { loadAuthLabels } from "@academy/cms/loaders/auth"
import {
  loginMutation,
  resendConfirmationMutation,
} from "@academy/courses-api/graphql/mutations/auth"
import { LoginPage } from "@academy/user-ui/components/pages/auth/login"
import type { LoginActionData, LoginInput } from "@academy/user-ui/types/auth"
import { redirect, useNavigation } from "react-router"
import { postAuthTarget, redirectIfAuthenticated } from "../../lib/auth"
import type { Route } from "./+types/login"
import type { PostHogContext } from "../../lib/posthog-middleware"

export async function loader({ request, params: { lang } }: Route.LoaderArgs) {
  await redirectIfAuthenticated(request, lang)
  const labels = await loadAuthLabels(lang)
  return { labels }
}

/** Errors are returned as CODES (keys of AuthErrorLabels); the page maps them
 *  to CMS copy — actions never need to fetch labels. */
export async function action({
  request,
  params,
  context,
}: Route.ActionArgs): Promise<LoginActionData | Response> {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "login")
  const identifier = String(form.get("identifier") ?? "").trim()

  // "reenviar correo" from the unconfirmed-account notice.
  if (intent === "resend") {
    if (identifier) {
      try {
        // The API resolves username-or-email to the account server-side.
        await resendConfirmationMutation(request, { identifier })
      } catch {
        // The resolver always reports success; ignore transport errors here.
      }
    }
    return { needsConfirmation: true, identifier, resent: true }
  }

  const password = String(form.get("password") ?? "")

  const fieldErrors: LoginActionData["fieldErrors"] = {}
  if (!identifier) fieldErrors.identifier = "required"
  if (!password) fieldErrors.password = "required"
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const input: LoginInput = {
    username: identifier.includes("@") ? null : identifier,
    email: identifier.includes("@") ? identifier : null,
    password,
  }

  try {
    const { data: loginresult, setCookies } = await loginMutation({
      request,
      variables: { input },
    })

    if (!loginresult?.login.token) {
      return { formError: "invalidCredentials" }
    }

    const posthog = (context as PostHogContext).posthog
    posthog?.capture({ event: "user_logged_in" })

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return redirect(postAuthTarget(request, params.lang), { headers })
  } catch (error: any) {
    const message = String(error?.message ?? "")
    // The API blocks unconfirmed accounts with a specific message; surface the
    // resend affordance instead of a generic error.
    if (/confirmar tu correo/i.test(message)) {
      return { needsConfirmation: true, identifier }
    }
    if (/registrada con/i.test(message)) {
      return { formError: "socialAuth" }
    }
    return { formError: "invalidCredentials" }
  }
}

export default function LoginRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { labels } = loaderData
  const navigation = useNavigation()

  return (
    <LoginPage
      errors={actionData ?? undefined}
      submitting={navigation.state === "submitting"}
      labels={labels.login}
      shellLabels={labels.shell}
      errorLabels={labels.errors}
    />
  )
}
