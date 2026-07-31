import { createAccountMutation } from "@academy/courses-api/graphql/mutations/auth"
import { validateInviteToken } from "@academy/courses-api/graphql/admin-app/queries/invites"
import {
  AdminAuthShell,
  AuthAlert,
} from "@academy/admin-ui/components/auth/auth-shell"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  passwordPolicyError,
  type AdminActionData,
} from "@academy/admin-ui/types/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Form, Link, redirect, useNavigation } from "react-router"
import type { Route } from "./+types/invite"
import { PasswordField } from "@academy/user-ui/components/shared/auth-shell"

export function meta() {
  return [{ title: "USPK Academy | Aceptar invitación" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  if (!token) return { token, status: "missing" as const, email: null }

  const result = await validateInviteToken(request, token)
  const invite = result.validateInviteToken

  const status = invite.valid
    ? ("valid" as const)
    : invite.expired
      ? ("expired" as const)
      : invite.used
        ? ("used" as const)
        : ("invalid" as const)

  return { token, status, email: invite.data?.email ?? null }
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AdminActionData | Response> {
  const form = await request.formData()
  const token = String(form.get("token") ?? "")
  const fullName = String(form.get("fullName") ?? "").trim()
  const username = String(form.get("username") ?? "").trim()
  const email = String(form.get("email") ?? "").trim()
  const password = String(form.get("password") ?? "")

  if (!token) return { formError: "La invitación no es válida." }

  const fieldErrors: Record<string, string> = {}
  if (!fullName) fieldErrors.fullName = "Requerido"
  if (!username) fieldErrors.username = "Requerido"
  if (!email) fieldErrors.email = "Requerido"
  const policyError = passwordPolicyError(password)
  if (policyError) fieldErrors.password = policyError
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  try {
    // The token carries the role/company; the API derives them, not the client.
    const { setCookies } = await createAccountMutation({
      request,
      variables: { input: { fullName, username, email, password, token } },
    })

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return redirect("/login", { headers })
  } catch (error: any) {
    return {
      formError:
        String(error?.message ?? "") ||
        "No pudimos crear la cuenta. Intenta de nuevo.",
    }
  }
}

const INVALID_COPY: Record<string, string> = {
  missing: "Falta el token de invitación en el enlace.",
  expired: "Esta invitación expiró. Pide que te la reenvíen.",
  used: "Esta invitación ya se usó. Inicia sesión con tu cuenta.",
  invalid: "Esta invitación no es válida.",
}

export default function InviteRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"
  const { token, status, email } = loaderData

  if (status !== "valid") {
    return (
      <AdminAuthShell title="Invitación no disponible">
        <AuthAlert>{INVALID_COPY[status]}</AuthAlert>
        <BrandButton to="/login" variant="primary" className="w-full justify-center">
          Ir a iniciar sesión
        </BrandButton>
      </AdminAuthShell>
    )
  }

  return (
    <AdminAuthShell
      title="Crea tu cuenta"
      description="Completa tus datos para activar el acceso al panel."
      footer={
        <Link to="/login" className="font-bold text-action-secondary underline-offset-2 hover:underline">
          Ya tengo cuenta
        </Link>
      }
    >
      {actionData?.formError && <AuthAlert>{actionData.formError}</AuthAlert>}

      <Form method="post" className="space-y-4" noValidate>
        <input type="hidden" name="token" value={token} />
        <Field
          label="Nombre completo"
          htmlFor="fullName"
          error={actionData?.fieldErrors?.fullName}
        >
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </Field>
        <Field
          label="Usuario"
          htmlFor="username"
          error={actionData?.fieldErrors?.username}
          hint="Lo usarás para iniciar sesión."
        >
          <Input id="username" name="username" autoComplete="username" required />
        </Field>
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
            defaultValue={email ?? ""}
            // The invite is bound to this address server-side.
            readOnly={Boolean(email)}
            required
          />
        </Field>
          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            label="Contraseña"
            error={actionData?.fieldErrors?.password}
            required
          />
        <BrandButton type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </BrandButton>
      </Form>
    </AdminAuthShell>
  )
}
