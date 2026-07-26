import { loadAuthLabels } from "@academy/cms/loaders/auth"
import { chngePasswordMutation } from "@academy/courses-api/graphql/mutations/auth"
import { ChangePasswordPage } from "@academy/user-ui/components/pages/auth/change-password"
import type { ChangePasswordActionData } from "@academy/user-ui/types/auth"
import { useNavigation, useSearchParams } from "react-router"
import type { Route } from "./+types/change-password"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const labels = await loadAuthLabels(lang)
  return { labels }
}

/** Errors are returned as CODES (keys of AuthErrorLabels). */
export async function action({
  request,
}: Route.ActionArgs): Promise<ChangePasswordActionData> {
  const form = await request.formData()
  const token = String(form.get("token") ?? "")
  const password = String(form.get("password") ?? "")
  const confirmPassword = String(form.get("confirmPassword") ?? "")

  const fieldErrors: ChangePasswordActionData["fieldErrors"] = {}
  if (password.length < 8) fieldErrors.password = "minPassword"
  if (confirmPassword !== password)
    fieldErrors.confirmPassword = "passwordMismatch"
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  if (!token) {
    return { formError: "invalidLink" }
  }

  try {
    await chngePasswordMutation(request, { token, password })
  } catch {
    return { formError: "invalidLink" }
  }

  return { success: true }
}

export default function ChangePasswordRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { labels } = loaderData
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? undefined

  return (
    <ChangePasswordPage
      errors={actionData ?? undefined}
      submitting={navigation.state === "submitting"}
      token={token}
      labels={labels.change}
      shellLabels={labels.shell}
      errorLabels={labels.errors}
    />
  )
}
