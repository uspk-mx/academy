import type {
  AuthShellLabels,
  ConfirmAccountLabels,
} from "@academy/user-ui/types/auth"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Link } from "react-router"
import { AuthShell } from "../../shared/auth-shell"

export interface ConfirmAccountPageProps {
  /** Lang-scoped login href. */
  loginHref: string
  labels: ConfirmAccountLabels
  shellLabels: AuthShellLabels
}

/**
 * Rendered only for the failure case — a valid token redirects straight to
 * login from the route loader, so this page never shows a success state.
 */
export function ConfirmAccountPage({
  loginHref,
  labels,
  shellLabels,
}: ConfirmAccountPageProps) {
  return (
    <AuthShell labels={shellLabels}>
      <div className="flex flex-col items-start gap-6">
        <span className="flex size-12 items-center justify-center rounded-card border-2 border-border-strong bg-academy-coral-soft">
          <IconAlertTriangle aria-hidden className="size-6" />
        </span>
        <header>
          <h1 className="text-page-title leading-display font-bold tracking-display">
            {labels.confirmFailedTitle}
          </h1>
          <p className="mt-2.5 text-base text-content-muted">
            {labels.confirmFailedText}
          </p>
        </header>
        <Link
          to={loginHref}
          className="font-bold text-action-secondary underline-offset-2 hover:underline"
        >
          {labels.confirmGoToLoginCta}
        </Link>
      </div>
    </AuthShell>
  )
}
