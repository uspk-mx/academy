import { chngePasswordMutation } from "@academy/courses-api/graphql/mutations/auth"
import {
  AdminAuthShell,
  AuthAlert,
} from "@academy/admin-ui/components/auth/auth-shell"
import { Field } from "@academy/admin-ui/components/ui/field"
import { PasswordInput } from "@academy/admin-ui/components/ui/input"
import {
  passwordPolicyError,
  type AdminActionData,
} from "@academy/admin-ui/types/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Form, Link, useNavigation, useSearchParams } from "react-router"
import type { Route } from "./+types/change-password"

export function meta() {
  return [{ title: "USPK Academy | Nueva contraseña" }]
}

/** Reached from the emailed reset link, which carries `?token=`. */
export function loader({ request }: Route.LoaderArgs) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  return { hasToken: Boolean(token) }
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AdminActionData> {
  const form = await request.formData()
  const token = String(form.get("token") ?? "")
  const password = String(form.get("password") ?? "")
  const confirmPassword = String(form.get("confirmPassword") ?? "")

  if (!token) return { formError: "El enlace no es válido o ya expiró." }

  const fieldErrors: Record<string, string> = {}
  const policyError = passwordPolicyError(password)
  if (policyError) fieldErrors.password = policyError
  if (password !== confirmPassword)
    fieldErrors.confirmPassword = "Las contraseñas no coinciden."
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  try {
    await chngePasswordMutation(request, { token, password })
    return { success: true }
  } catch {
    return { formError: "El enlace no es válido o ya expiró." }
  }
}

export default function ChangePasswordRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const submitting = navigation.state === "submitting"

  if (!loaderData.hasToken) {
    return (
      <AdminAuthShell title="Enlace no válido">
        <AuthAlert>
          Este enlace no es válido o ya expiró. Solicita uno nuevo.
        </AuthAlert>
        <BrandButton to="/password/reset" variant="primary" className="w-full justify-center">
          Solicitar otro enlace
        </BrandButton>
      </AdminAuthShell>
    )
  }

  return (
    <AdminAuthShell
      title="Nueva contraseña"
      description="Elige una contraseña que no hayas usado antes."
    >
      {actionData?.formError && <AuthAlert>{actionData.formError}</AuthAlert>}

      {actionData?.success ? (
        <>
          <AuthAlert tone="success">
            Tu contraseña se actualizó correctamente.
          </AuthAlert>
          <BrandButton to="/login" variant="primary" className="w-full justify-center">
            Iniciar sesión
          </BrandButton>
        </>
      ) : (
        <Form method="post" className="space-y-4" noValidate>
          <input
            type="hidden"
            name="token"
            value={searchParams.get("token") ?? ""}
          />
          <Field
            label="Contraseña"
            htmlFor="password"
            error={actionData?.fieldErrors?.password}
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field
            label="Confirmar contraseña"
            htmlFor="confirmPassword"
            error={actionData?.fieldErrors?.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
            />
          </Field>
          <BrandButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar contraseña"}
          </BrandButton>
        </Form>
      )}
    </AdminAuthShell>
  )
}
