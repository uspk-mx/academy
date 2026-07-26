import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import {
  AuthDivider,
  AuthField,
  AuthShell,
  GoogleIcon,
  MicrosoftIcon,
  SocialButton,
} from "@academy/user-ui/components/shared/auth-shell"
import { Checkbox } from "@academy/user-ui/components/ui/checkbox"
import { Label } from "@academy/user-ui/components/ui/label"
import { googleOAuthUrl } from "@academy/user-ui/lib/site-urls"
import type {
  AuthErrorLabels,
  AuthShellLabels,
  SignupActionData,
  SignupLabels,
} from "@academy/user-ui/types/auth"
import { IconMail } from "@tabler/icons-react"
import { Form, Link, useParams, useSearchParams } from "react-router"

export interface SignupPageProps {
  errors?: SignupActionData
  submitting?: boolean
  labels: SignupLabels
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

export function SignupPage({
  errors,
  submitting,
  labels,
  shellLabels,
  errorLabels,
}: SignupPageProps) {
  const { lang } = useParams()
  const [searchParams] = useSearchParams()
  // Same Google flow as login — first-time users get an account created, so this
  // is "sign up with Google" too. Preserves the intended post-login destination.
  const googleHref = googleOAuthUrl(lang ?? "en", searchParams.get("redirect"))

  if (errors?.success) {
    return (
      <AuthShell labels={shellLabels}>
        <div className="flex flex-col items-start gap-6">
          <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-green-soft">
            <IconMail aria-hidden className="size-6" />
          </span>
          <header>
            <h1 className="text-page-title leading-display font-bold tracking-display">
              {labels.signupSuccessTitle}{" "}
              <em className="font-heading font-medium italic">
                {labels.signupSuccessTitleAccent}
              </em>
              .
            </h1>
            <p className="mt-2.5 text-base text-content-muted">
              {labels.signupSuccessTextBefore}
              {errors.email ? (
                <>
                  {" "}
                  <span className="font-bold text-content-primary">
                    {errors.email}
                  </span>
                </>
              ) : null}
              . {labels.signupSuccessTextAfter}
            </p>
          </header>
          <p className="text-sm text-content-muted">{labels.signupSpamHint}</p>
          <Link
            to={`/${lang}/login`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.signupGoToLoginCta}
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
            {labels.signupTitle}{" "}
            <em className="font-heading font-medium italic">
              {labels.signupTitleAccent}
            </em>
            .
          </h1>
          <p className="mt-2.5 text-base text-content-muted">
            {labels.signupSubtitle}
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

        <Form method="post" className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <AuthField
              label={labels.signupNameLabel}
              name="fullName"
              autoComplete="name"
              placeholder={labels.signupNamePlaceholder}
              required
              error={errorText(errors?.fieldErrors?.fullName, errorLabels)}
            />
            <AuthField
              label={labels.signupUsernameLabel}
              name="username"
              autoComplete="username"
              placeholder={labels.signupUsernamePlaceholder}
              hint={labels.signupUsernameHint}
              required
              error={errorText(errors?.fieldErrors?.username, errorLabels)}
            />
            <AuthField
              label={labels.signupEmailLabel}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={labels.signupEmailPlaceholder}
              required
              error={errorText(errors?.fieldErrors?.email, errorLabels)}
            />
            <AuthField
              label={labels.signupPasswordLabel}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={labels.signupPasswordPlaceholder}
              minLength={8}
              required
              error={errorText(errors?.fieldErrors?.password, errorLabels)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <Checkbox id="terms" name="terms" className="mt-0.5" />
              <Label
                htmlFor="terms"
                className="text-sm leading-body font-normal text-content-muted"
              >
                {labels.signupTermsPrefix}{" "}
                <Link
                  to={`/${lang}/terms`}
                  className="font-semibold text-action-secondary underline-offset-2 hover:underline"
                >
                  {labels.signupTermsLabel}
                </Link>{" "}
                {labels.signupTermsJoin}{" "}
                <Link
                  to={`/${lang}/privacy`}
                  className="font-semibold text-action-secondary underline-offset-2 hover:underline"
                >
                  {labels.signupPrivacyLabel}
                </Link>
                .
              </Label>
            </div>
            {errors?.fieldErrors?.terms && (
              <p className="text-label font-semibold text-academy-coral">
                {errorText(errors.fieldErrors.terms, errorLabels)}
              </p>
            )}
          </div>

          <BrandButton
            type="submit"
            size="lg"
            withArrow
            disabled={submitting}
            className="w-full"
          >
            {submitting
              ? labels.signupSubmittingLabel
              : labels.signupSubmitLabel}
          </BrandButton>
        </Form>

        <AuthDivider>{labels.signupDividerLabel}</AuthDivider>

        <div className="flex gap-2.5">
          <SocialButton
            onClick={() => {
              window.location.href = googleHref
            }}
          >
            <GoogleIcon /> Google
          </SocialButton>
          {/* TODO(auth): Microsoft OAuth not wired on the API yet. */}
          <SocialButton onClick={() => console.log("oauth microsoft")}>
            <MicrosoftIcon /> Microsoft
          </SocialButton>
        </div>

        <p className="text-center text-sm text-content-muted">
          {labels.signupHasAccountText}{" "}
          <Link
            to={`/${lang}/login`}
            className="font-bold text-action-secondary underline-offset-2 hover:underline"
          >
            {labels.signupHasAccountCta}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
