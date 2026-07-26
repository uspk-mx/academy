import type {
  AuthErrorLabels,
  AuthShellLabels,
  ChangePasswordActionData,
  ChangePasswordLabels,
} from "@academy/user-ui/types/auth"
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react"
import { Form, Link, useParams } from "react-router"
import { BrandButton } from "../../brand/brand-button"
import { AuthField, AuthShell } from "../../shared/auth-shell"

export interface ChangePasswordPageProps {
  errors?: ChangePasswordActionData
  submitting?: boolean
  /** Reset token from the `?token=` query param; missing → invalid-link state. */
  token?: string
  labels: ChangePasswordLabels
  shellLabels: AuthShellLabels
  errorLabels: AuthErrorLabels
}

function errorText(
  code: string | undefined,
  errorLabels: AuthErrorLabels
): string | undefined {
  if (!code) return undefined
  return errorLabels[code as keyof AuthErrorLabels] ?? code
}

export function ChangePasswordPage({
  errors,
  submitting,
  token,
  labels,
  shellLabels,
  errorLabels,
}: ChangePasswordPageProps) {
  const { lang } = useParams()

  if (errors?.success) {
    return (
      <AuthShell labels={shellLabels}>
        <div className="flex flex-col items-start gap-6">
          <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-green-soft">
            <IconCircleCheck aria-hidden className="size-6" />
          </span>
          <header>
            <h1 className="text-page-title leading-display font-bold tracking-display">
              {labels.changeSuccessTitle}{" "}
              <em className="font-heading font-medium italic">
                {labels.changeSuccessTitleAccent}
              </em>
              .
            </h1>
            <p className="mt-2.5 text-base text-content-muted">
              {labels.changeSuccessText}
            </p>
          </header>
          <BrandButton to={`/${lang}/login`} size="lg">
            {labels.changeSuccessCta}
          </BrandButton>
        </div>
      </AuthShell>
    )
  }

  if (!token) {
    return (
      <AuthShell labels={shellLabels}>
        <div className="flex flex-col items-start gap-6">
          <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-coral-soft">
            <IconAlertTriangle aria-hidden className="size-6" />
          </span>
          <header>
            <h1 className="text-page-title leading-display font-bold tracking-display">
              {labels.changeInvalidTitle}
            </h1>
            <p className="mt-2.5 text-base text-content-muted">
              {labels.changeInvalidText}
            </p>
          </header>
          <Link
            to={`/${lang}/forgot-password`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.changeInvalidCta}
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell labels={shellLabels}>
      <div className="flex flex-col gap-7">
        <header>
          <h1 className="text-page-title leading-display font-bold tracking-display">
            {labels.changeTitle}{" "}
            <em className="font-heading font-medium italic">
              {labels.changeTitleAccent}
            </em>
            .
          </h1>
          <p className="mt-2.5 text-base text-content-muted">
            {labels.changeSubtitle}
          </p>
        </header>

        {errors?.formError && (
          <p
            role="alert"
            className="rounded-card border-2 border-border-strong bg-academy-coral-soft p-3 text-sm font-semibold"
          >
            {errorText(errors.formError, errorLabels)}
          </p>
        )}

        <Form method="post" className="flex flex-col gap-7" noValidate>
          <input type="hidden" name="token" value={token} />
          <div className="flex flex-col gap-4">
            <AuthField
              label={labels.changePasswordLabel}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={labels.changePasswordPlaceholder}
              minLength={8}
              required
              error={errorText(errors?.fieldErrors?.password, errorLabels)}
            />
            <AuthField
              label={labels.changeConfirmLabel}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder={labels.changeConfirmPlaceholder}
              required
              error={errorText(
                errors?.fieldErrors?.confirmPassword,
                errorLabels
              )}
            />
          </div>

          <BrandButton
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting
              ? labels.changeSubmittingLabel
              : labels.changeSubmitLabel}
          </BrandButton>
        </Form>
      </div>
    </AuthShell>
  )
}
