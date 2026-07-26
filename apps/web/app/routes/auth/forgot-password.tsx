import { loadAuthLabels } from "@academy/cms/loaders/auth"
import { forgotPasswordMutation } from "@academy/courses-api/graphql/mutations/auth"
import { ForgotPasswordPage } from "@academy/user-ui/components/pages/auth/forgot-password"
import type { ForgotPasswordActionData } from "@academy/user-ui/types/auth"
import { useNavigation } from "react-router"
import type { Route } from "./+types/forgot-password"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const labels = await loadAuthLabels(lang)
  return { labels }
}

export async function action({
  request,
}: Route.ActionArgs): Promise<ForgotPasswordActionData> {
  const form = await request.formData()
  const email = String(form.get("email") ?? "").trim()

  if (!email.includes("@")) {
    return { fieldErrors: { email: "invalidEmail" } }
  }

  try {
    await forgotPasswordMutation(request, { email })
  } catch {
    // Non-enumerating: never reveal whether an account exists for this email —
    // the confirmation below is shown regardless of the result.
  }

  return { success: true, email }
}

export default function ForgotPasswordRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { labels } = loaderData
  const navigation = useNavigation()
  return (
    <ForgotPasswordPage
      errors={actionData ?? undefined}
      submitting={navigation.state === "submitting"}
      labels={labels.forgot}
      shellLabels={labels.shell}
      errorLabels={labels.errors}
    />
  )
}
