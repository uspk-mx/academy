import type {
  AuthErrorLabels,
  AuthShellLabels,
  ForgotPasswordActionData,
  ForgotPasswordLabels,
} from "@academy/user-ui/types/auth"
import { IconMail } from "@tabler/icons-react"
import { Form, Link, useParams } from "react-router"
import { BrandButton } from "../../brand/brand-button"
import { AuthField, AuthShell } from "../../shared/auth-shell"

export interface ForgotPasswordPageProps {
  errors?: ForgotPasswordActionData
  submitting?: boolean
  labels: ForgotPasswordLabels
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

export function ForgotPasswordPage({
  errors,
  submitting,
  labels,
  shellLabels,
  errorLabels,
}: ForgotPasswordPageProps) {
  const { lang } = useParams()

  if (errors?.success) {
    return (
      <AuthShell labels={shellLabels}>
        <div className="flex flex-col items-start gap-6">
          <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-green-soft">
            <IconMail aria-hidden className="size-6" />
          </span>
          <header>
            <h1 className="text-page-title leading-display font-bold tracking-display">
              {labels.forgotSuccessTitle}{" "}
              <em className="font-heading font-medium italic">
                {labels.forgotSuccessTitleAccent}
              </em>
              .
            </h1>
            <p className="mt-2.5 text-base text-content-muted">
              {labels.forgotSuccessTextBefore}
              {errors.email ? (
                <>
                  {" "}
                  <span className="font-bold text-content-primary">
                    {errors.email}
                  </span>
                </>
              ) : null}
              , {labels.forgotSuccessTextAfter}
            </p>
          </header>
          <p className="text-sm text-content-muted">{labels.forgotSpamHint}</p>
          <Link
            to={`/${lang}/login`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.forgotBackToLoginCta}
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
            {labels.forgotTitle}{" "}
            <em className="font-heading font-medium italic">
              {labels.forgotTitleAccent}
            </em>
            {labels.forgotTitleSuffix}
          </h1>
          <p className="mt-2.5 text-base text-content-muted">
            {labels.forgotSubtitle}
          </p>
        </header>

        <Form method="post" className="flex flex-col gap-7" noValidate>
          <AuthField
            label={labels.forgotEmailLabel}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={labels.forgotEmailPlaceholder}
            required
            error={errorText(errors?.fieldErrors?.email, errorLabels)}
          />

          <BrandButton
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting
              ? labels.forgotSubmittingLabel
              : labels.forgotSubmitLabel}
          </BrandButton>
        </Form>

        <p className="text-center text-sm text-content-muted">
          {labels.forgotRememberedText}{" "}
          <Link
            to={`/${lang}/login`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.forgotRememberedCta}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
