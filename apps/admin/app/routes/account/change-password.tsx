import { updateUserPassword } from "@academy/courses-api/graphql/admin-app/mutations/account"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@academy/admin-ui/components/ui/card"
import { Field } from "@academy/admin-ui/components/ui/field"
import { PasswordInput } from "@academy/admin-ui/components/ui/input"
import {
  passwordPolicyError,
  type AdminActionData,
} from "@academy/admin-ui/types/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { useEffect } from "react"
import { Form, useNavigation } from "react-router"
import { toast } from "sonner"
import type { Route } from "./+types/change-password"

export function meta() {
  return [{ title: "USPK Academy | Cambiar contraseña" }]
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AdminActionData> {
  const form = await request.formData()
  const currentPassword = String(form.get("currentPassword") ?? "")
  const newPassword = String(form.get("newPassword") ?? "")
  const confirmPassword = String(form.get("confirmPassword") ?? "")

  const fieldErrors: Record<string, string> = {}
  if (!currentPassword) fieldErrors.currentPassword = "Requerido"
  const policyError = passwordPolicyError(newPassword)
  if (policyError) fieldErrors.newPassword = policyError
  if (newPassword !== confirmPassword)
    fieldErrors.confirmPassword = "Las contraseñas no coinciden."
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const { error } = await updateUserPassword(request, {
    input: { currentPassword, newPassword },
  })

  if (error) return { formError: error.message }
  return { success: true }
}

export default function AccountChangePassword({
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"

  useEffect(() => {
    if (actionData?.success) toast.success("Contraseña actualizada")
    else if (actionData?.formError) toast.error(actionData.formError)
  }, [actionData])

  return (
    <>
      <PageBreadcrumbs
        items={[{ label: "Cuenta" }, { label: "Cambiar contraseña" }]}
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Necesitas tu contraseña actual para confirmar el cambio.
          </CardDescription>
        </CardHeader>
        <Form method="post" className="space-y-4" noValidate>
          <Field
            label="Contraseña actual"
            htmlFor="currentPassword"
            error={actionData?.fieldErrors?.currentPassword}
          >
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field
            label="Nueva contraseña"
            htmlFor="newPassword"
            error={actionData?.fieldErrors?.newPassword}
          >
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field
            label="Confirmar nueva contraseña"
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
          <BrandButton type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </BrandButton>
        </Form>
      </Card>
    </>
  )
}
