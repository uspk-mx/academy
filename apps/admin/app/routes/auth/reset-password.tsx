import { forgotPasswordMutation } from "@academy/courses-api/graphql/mutations/auth"
import {
  AdminAuthShell,
  AuthAlert,
} from "@academy/admin-ui/components/auth/auth-shell"
import { Field } from "@academy/admin-ui/components/ui/field"
import type { AdminActionData } from "@academy/admin-ui/types/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Form, Link, useNavigation } from "react-router"
import type { Route } from "./+types/reset-password"

export function meta() {
  return [{ title: "USPK Academy | Recuperar contraseña" }]
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AdminActionData> {
  const form = await request.formData()
  const email = String(form.get("email") ?? "").trim()

  if (!email) return { fieldErrors: { email: "Requerido" } }

  // Always report success: telling the visitor whether an address exists would
  // turn this form into an account enumeration oracle.
  try {
    await forgotPasswordMutation(request, { email })
  } catch {
    // Swallowed on purpose — see above.
  }

  return { success: true }
}

export default function ResetPasswordRoute({
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"

  return (
    <AdminAuthShell
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para crear una nueva."
      footer={
        <Link to="/login" className="font-bold text-action-secondary underline-offset-2 hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      {actionData?.success ? (
        <AuthAlert tone="success">
          Si la cuenta existe, recibirás un correo con el enlace de recuperación.
          Revisa también tu carpeta de spam.
        </AuthAlert>
      ) : (
        <Form method="post" className="space-y-4" noValidate>
          <Field
            label="Correo"
            htmlFor="email"
            error={actionData?.fieldErrors?.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@uspkacademy.com"
              required
            />
          </Field>
          <BrandButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar enlace"}
          </BrandButton>
        </Form>
      )}
    </AdminAuthShell>
  )
}
