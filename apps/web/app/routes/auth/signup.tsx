import { loadAuthLabels } from "@academy/cms/loaders/auth"
import {
  createAccountMutation,
  type CreateAccountMutationVariables,
} from "@academy/courses-api/graphql/mutations/auth"
import { SignupPage } from "@academy/user-ui/components/pages/auth/signup"
import type { SignupActionData } from "@academy/user-ui/types/auth"
import { data, useNavigation } from "react-router"
import { redirectIfAuthenticated } from "../../lib/auth"
import type { Route } from "./+types/signup"
import type { PostHogContext } from "../../lib/posthog-middleware"

export async function loader({ request, params: { lang } }: Route.LoaderArgs) {
  await redirectIfAuthenticated(request, lang)
  const labels = await loadAuthLabels(lang)
  return { labels }
}

/** Errors are returned as CODES (keys of AuthErrorLabels). */
export async function action({ request, context }: Route.ActionArgs) {
  const form = await request.formData()
  const fullName = String(form.get("fullName") ?? "").trim()
  const username = String(form.get("username") ?? "").trim()
  const email = String(form.get("email") ?? "").trim()
  const password = String(form.get("password") ?? "")

  const fieldErrors: SignupActionData["fieldErrors"] = {}
  if (!fullName) fieldErrors.fullName = "required"
  if (!username) fieldErrors.username = "required"
  if (!email.includes("@")) fieldErrors.email = "invalidEmail"
  const strongPassword =
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[!@#~$%^&*(),.?":{}|<>]/.test(password)
  if (!strongPassword) fieldErrors.password = "passwordPolicy"
  if (form.get("terms") !== "on") fieldErrors.terms = "termsRequired"
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const input: CreateAccountMutationVariables["input"] = {
    username,
    password,
    fullName,
    email,
  }

  try {
    const { data: createAccountResult, setCookies } =
      await createAccountMutation({
        request,
        variables: { input },
      })

    if (!createAccountResult?.createUser) {
      return { formError: "generic" }
    }

    const posthog = (context as PostHogContext).posthog
    posthog?.capture({ event: "user_signed_up" })

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    // Signup no longer logs in — the account must be confirmed by email first.
    return data({ success: true, email }, { headers })
  } catch (error: any) {
    if (/already exists|ya existe/i.test(String(error?.message ?? ""))) {
      return { formError: "emailTaken" }
    }
    return { formError: "generic" }
  }
}

export default function SignupRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { labels } = loaderData
  const navigation = useNavigation()
  return (
    <SignupPage
      errors={actionData ?? undefined}
      submitting={navigation.state === "submitting"}
      labels={labels.signup}
      shellLabels={labels.shell}
      errorLabels={labels.errors}
    />
  )
}
