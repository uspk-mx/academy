import { loginMutation } from "@academy/courses-api/graphql/mutations/auth"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import {
  AdminAuthShell,
  AuthAlert,
} from "@academy/admin-ui/components/auth/auth-shell"
import { isStaffRole } from "@academy/admin-ui/middleware/auth"
import { safeRedirect } from "@academy/admin-ui/lib/utils"
import type { AdminActionData } from "@academy/admin-ui/types/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import {
  AuthField,
  PasswordField,
} from "@academy/user-ui/components/shared/auth-shell"
import { Form, Link, redirect, useNavigation, useSearchParams } from "react-router"
import type { Route } from "./+types/login"
import type { PostHogContext } from "../../lib/posthog-middleware"

export function meta() {
  return [{ title: "USPK Academy | Iniciar sesión" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const me = await getMe(request)
  // Already signed in as staff — skip the form. A signed-in non-staff user
  // stays here so they can log in with the right account.
  if (isStaffRole(me?.me?.role)) {
    const redirectTo = new URL(request.url).searchParams.get("redirect")
    throw redirect(safeRedirect(redirectTo, "/courses"))
  }
  return null
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<AdminActionData | Response> {
  const form = await request.formData()
  const identifier = String(form.get("identifier") ?? "").trim()
  const password = String(form.get("password") ?? "")
  const redirectTo = safeRedirect(String(form.get("redirect") ?? ""), "/courses")

  const fieldErrors: Record<string, string> = {}
  if (!identifier) fieldErrors.identifier = "Requerido"
  if (!password) fieldErrors.password = "Requerido"
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  try {
    const { data, setCookies } = await loginMutation({
      request,
      variables: {
        input: {
          username: identifier.includes("@") ? null : identifier,
          email: identifier.includes("@") ? identifier : null,
          password,
        },
      },
    })

    console.log("data: ", data)

    if (!data?.login.token) {
      return { formError: "Credenciales incorrectas." }
    }

    // The panel is staff-only; a valid student/business login must not slip in.
    if (!isStaffRole(data.login.role)) {
      return {
        formError: "Esta cuenta no tiene acceso al panel de administración.",
      }
    }

    const posthog = (context as PostHogContext).posthog
    posthog?.capture({ event: "admin_logged_in" })

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return redirect("/", { headers })
  } catch (error: any) {
    return { formError: loginErrorMessage(String(error?.message ?? "")) }
  }
}

/**
 * The API returns a distinct Spanish message per failure. Collapsing them all
 * into "credenciales incorrectas" hides the two that matter most — the rate
 * limiter (5 attempts / 15 min per IP, counted on *every* attempt, successful
 * ones included) and an unconfirmed email — and leaves people retrying a
 * password that was already correct.
 */
function loginErrorMessage(message: string): string {
  if (/demasiados intentos|rate limit/i.test(message)) {
    return "Demasiados intentos de inicio de sesión. Espera unos minutos y vuelve a intentar."
  }
  if (/confirmar tu correo/i.test(message)) {
    return "Necesitas confirmar tu correo antes de entrar."
  }
  if (/registrada con/i.test(message)) {
    return "Esta cuenta usa inicio de sesión social."
  }
  if (/no registrado/i.test(message)) {
    return "No encontramos una cuenta con ese correo o usuario."
  }
  if (/contraseña incorrecta/i.test(message)) {
    return "Contraseña incorrecta."
  }
  // Anything else is a server/transport problem, not the visitor's fault —
  // claiming "wrong password" would send them down the wrong path.
  return message
    ? `No pudimos iniciar sesión: ${message}`
    : "No pudimos iniciar sesión. Intenta de nuevo."
}

export default function LoginRoute({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const submitting = navigation.state === "submitting"

  return (
    <AdminAuthShell
      title="Panel de"
      titleAccent="administración"
      description="Ingresa con tu cuenta de staff."
      footer={
        <Link
          to="/password/reset"
          className="font-bold text-action-secondary underline-offset-2 hover:underline"
        >
          Olvidé mi contraseña
        </Link>
      }
    >
      {actionData?.formError && <AuthAlert>{actionData.formError}</AuthAlert>}

      <Form method="post" className="flex flex-col gap-5" noValidate>
        <input
          type="hidden"
          name="redirect"
          value={searchParams.get("redirect") ?? ""}
        />
        <AuthField
          id="identifier"
          name="identifier"
          label="Correo o usuario"
          autoComplete="username"
          placeholder="admin@uspkacademy.com"
          required
          error={actionData?.fieldErrors?.identifier}
        />
        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={actionData?.fieldErrors?.password}
        />
        <BrandButton
          type="submit"
          variant="promo"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </BrandButton>
      </Form>
    </AdminAuthShell>
  )
}
