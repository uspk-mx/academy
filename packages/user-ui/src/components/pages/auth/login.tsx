import type {
  AuthErrorLabels,
  AuthShellLabels,
  LoginActionData,
  LoginLabels,
} from "@academy/user-ui/types/auth"
import { Form, Link, useParams, useSearchParams } from "react-router"
import { googleOAuthUrl } from "@academy/user-ui/lib/site-urls"
import { BrandButton } from "../../brand/brand-button"
import {
  AuthDivider,
  AuthField,
  AuthShell,
  GoogleIcon,
  MicrosoftIcon,
  SocialButton,
} from "../../shared/auth-shell"
import { Checkbox } from "../../ui/checkbox"
import { Label } from "../../ui/label"

export interface LoginPageProps {
  errors?: LoginActionData
  submitting?: boolean
  labels: LoginLabels
  shellLabels: AuthShellLabels
  errorLabels: AuthErrorLabels
}

/** Route actions return error *codes*; map them to CMS copy here. */
function errorText(
  code: string | undefined,
  errorLabels: AuthErrorLabels
): string | undefined {
  if (!code) return undefined
  return errorLabels[code as keyof AuthErrorLabels] ?? code
}

export function LoginPage({
  errors,
  submitting,
  labels,
  shellLabels,
  errorLabels,
}: LoginPageProps) {
  const { lang } = useParams()
  const [searchParams] = useSearchParams()
  const justConfirmed = searchParams.get("confirmed") === "1"
  // Start Google OAuth on the API, preserving where the visitor wanted to land
  // (the same `redirect` the password form honours).
  const googleHref = googleOAuthUrl(lang ?? "en", searchParams.get("redirect"))
  return (
    <AuthShell labels={shellLabels}>
      <div className="flex flex-col gap-7">
        <header>
          <h1 className="text-page-title leading-display font-bold tracking-display">
            {labels.loginTitle}{" "}
            <em className="font-heading font-medium italic">
              {labels.loginTitleAccent}
            </em>
            .
          </h1>
          <p className="mt-2.5 text-base text-content-muted">
            {labels.loginSubtitle}
          </p>
        </header>

        {justConfirmed && !errors?.needsConfirmation && (
          <p
            role="status"
            className="rounded-card border-2 border-border-strong bg-academy-green-soft p-3 text-sm font-semibold"
          >
            {labels.loginConfirmedBanner}
          </p>
        )}

        {errors?.needsConfirmation && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-card border-2 border-border-strong bg-academy-yellow-soft p-3 text-sm"
          >
            <p className="font-semibold">{labels.loginNeedsConfirmationText}</p>
            {errors.resent ? (
              <p className="font-semibold text-action-primary">
                {labels.loginResentText}
              </p>
            ) : (
              <Form method="post">
                <input type="hidden" name="intent" value="resend" />
                <input
                  type="hidden"
                  name="identifier"
                  value={errors.identifier ?? ""}
                />
                <button
                  type="submit"
                  className="font-bold text-action-secondary underline underline-offset-2"
                >
                  {labels.loginResendCta}
                </button>
              </Form>
            )}
          </div>
        )}

        {errors?.formError && (
          <p
            role="alert"
            className="rounded-card border-2 border-border-strong bg-academy-coral-soft p-3 text-sm font-semibold"
          >
            {errorText(errors.formError, errorLabels)}
          </p>
        )}

        <Form method="post" className="flex flex-col gap-7" noValidate>
          <div className="flex flex-col gap-4">
            <AuthField
              label={labels.loginIdentifierLabel}
              name="identifier"
              autoComplete="username"
              placeholder={labels.loginIdentifierPlaceholder}
              required
              error={errorText(errors?.fieldErrors?.identifier, errorLabels)}
            />
            <AuthField
              label={labels.loginPasswordLabel}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              error={errorText(errors?.fieldErrors?.password, errorLabels)}
              labelRight={
                <Link
                  to={`/${lang}/forgot-password`}
                  className="text-label font-semibold text-action-secondary underline-offset-2 hover:underline"
                >
                  {labels.loginForgotLabel}
                </Link>
              }
            />
            {/* Not part of the Login input — drives session cookie maxAge. */}
            <div className="flex items-center gap-2.5">
              <Checkbox id="remember" name="remember" />
              <Label htmlFor="remember" className="text-sm">
                {labels.loginRememberLabel}
              </Label>
            </div>
          </div>

          <BrandButton
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? labels.loginSubmittingLabel : labels.loginSubmitLabel}
          </BrandButton>
        </Form>

        <AuthDivider>{labels.loginDividerLabel}</AuthDivider>

        <div className="flex gap-2.5">
          <SocialButton
            onClick={() => {
              window.location.href = googleHref
            }}
          >
            <GoogleIcon /> Google
          </SocialButton>
        </div>

        <p className="text-center text-sm text-content-muted">
          {labels.loginNoAccountText}{" "}
          <Link
            to={`/${lang}/signup`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.loginNoAccountCta}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
