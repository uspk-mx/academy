import { cn } from "@academy/user-ui/lib/utils"
import { useState, type ComponentProps, type ReactNode } from "react"
import { Link } from "react-router"
import { HardCard, Pill } from "../brand/primitives"
import { IconCheck, IconEye, IconEyeClosed } from "@tabler/icons-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Tooltip, TooltipTrigger, TooltipContent} from "../ui/tooltip"

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Üspk academy — inicio"
      className={cn("inline-block", className)}
    >
      <img
        src="https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/logos/uspk-a-logo-black.png"
        alt="Üspk academy"
        className="block h-7 w-auto"
      />
    </Link>
  )
}

export interface AuthShellLabels {
  brandEyebrow: string
  brandTitle: string
  brandTitleAccent: string
  brandDescription: string
  /** Rendered after "© {year} ". */
  footerNote: string
}

export interface AuthShellProps {
  children: ReactNode
  labels: AuthShellLabels
  /** Right-hand brand panel; hidden below lg. Defaults to <BrandSidePanel />. */
  brandSide?: ReactNode
}

/**
 * Standalone auth layout (no site header/footer — these routes live outside
 * the marketing layout): form column on the page surface, yellow brand
 * panel on the right for lg+.
 */
export function AuthShell({ children, labels, brandSide }: AuthShellProps) {
  return (
    <div className="grid min-h-svh bg-surface-page lg:grid-cols-2">
      <div className="flex flex-col gap-10 px-6 py-8 sm:px-10 lg:px-16">
        <Wordmark />
        <div className="mx-auto my-auto w-full max-w-104">{children}</div>
        <p className="text-label text-content-muted">
          © {new Date().getFullYear().toString()} {labels.footerNote}
        </p>
      </div>

      <div
        className="relative hidden flex-col justify-center gap-8 overflow-hidden border-l-2 border-border-strong bg-academy-yellow p-16 lg:flex"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--color-academy-ink) 7%, transparent) 1.2px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      >
        {brandSide ?? <BrandSidePanel labels={labels} />}
      </div>
    </div>
  )
}

/** "What you're getting" preview: headline + mini progress card + achievement.
 *  The mini cards are decorative illustration; only the headline copy is CMS. */
export function BrandSidePanel({ labels }: { labels: AuthShellLabels }) {
  return (
    <>
      <div>
        <p className="text-label font-semibold tracking-tight-brand uppercase">
          {labels.brandEyebrow}
        </p>
        <h1 className="mt-4 text-hero leading-display font-bold tracking-display">
          {labels.brandTitle}
          <em className="block font-heading font-medium italic">
            {labels.brandTitleAccent}
          </em>
        </h1>
        <p className="mt-4 max-w-[24rem] text-lg leading-body text-content-primary/75">
          {labels.brandDescription}
        </p>
      </div>

      <HardCard aria-hidden className="max-w-84 rotate-[-1.5deg] p-card-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-label font-semibold text-content-muted">
            A1(a)
          </span>
          <Pill className="gap-1.5">
            <span
              aria-hidden
              className="size-1.5 rounded-pill bg-academy-coral"
            />
            En progreso
          </Pill>
        </div>
        <p className="mt-3 text-base font-bold tracking-tight-brand">
          People and Occupations
        </p>
        <div className="mt-3.5 flex items-center justify-between text-label">
          <span className="text-content-muted">Progreso</span>
          <span className="font-bold">45%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={45}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del curso"
          className="mt-1.5 h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted"
        >
          <div className="h-full w-[45%] border-r-2 border-border-strong bg-academy-yellow" />
        </div>
      </HardCard>

      {/* Floating achievement */}
      <HardCard
        shadow="xs"
        className="absolute right-16 bottom-16 flex max-w-70 rotate-3 items-center gap-3 p-3"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-card border-2 border-border-strong bg-academy-green text-content-inverse">
          <IconCheck aria-hidden className="size-5" strokeWidth={2.5} />
        </span>
        <span>
          <span className="block text-sm font-bold">Módulo 1 completo</span>
          <span className="block text-label text-content-muted">+ 50 XP</span>
        </span>
      </HardCard>
    </>
  )
}

/* -------------------------------- AuthField ------------------------------- */

export interface AuthFieldProps extends Omit<
  ComponentProps<typeof Input>,
  "className"
> {
  label: string
  /** Field name for the route action's FormData. */
  name: string
  hint?: string
  /** Slot next to the label (e.g. "¿Olvidaste tu contraseña?"). */
  labelRight?: ReactNode
  error?: string
}

export function AuthField({
  label,
  name,
  hint,
  labelRight,
  error,
  id,
  ...input
}: AuthFieldProps) {
  const fieldId = id ?? name
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={fieldId} className="text-sm font-bold">
          {label}
        </Label>
        {labelRight}
      </div>
      <Input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-button border-2 border-border-strong bg-surface-card px-4 shadow-hard-xs",
          error && "border-academy-coral"
        )}
        {...input}
      />
      {error ? (
        <p
          id={`${fieldId}-error`}
          className="text-label font-semibold text-academy-coral"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${fieldId}-hint`} className="text-label text-content-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function PasswordField({
  label,
  name,
  hint,
  labelRight,
  error,
  id,
  ...input
}: Omit<AuthFieldProps, 'type'>) {
  const [showPassword, setShowPassword] = useState(false)
  const fieldId = id ?? name
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={fieldId} className="text-sm font-bold">
          {label}
        </Label>
        {labelRight}
      </div>
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 rounded-button border-2 border-border-strong bg-surface-card px-4 pr-9 shadow-hard-xs",
            error && "border-academy-coral"
          )}
          type={showPassword ? "text" : "password"}
          {...input}
        />
        <div className="absolute top-3 right-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon-xs"
                  variant="ghost"
                />
              }
            >
              {showPassword ? <IconEye /> : <IconEyeClosed />}
            </TooltipTrigger>
            <TooltipContent>
              {showPassword ? "Hide password" : "Show password"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {error ? (
        <p
          id={`${fieldId}-error`}
          className="text-label font-semibold text-academy-coral"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${fieldId}-hint`} className="text-label text-content-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/* ------------------------------ SocialButton ------------------------------ */

export function SocialButton({
  children,
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-4 py-2.5 text-sm font-bold tracking-tight-brand shadow-hard-xs transition-[translate,box-shadow] duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue active:translate-x-0 active:translate-y-0 active:shadow-hard-xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function GoogleIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1 7.9 2.9l5.7-5.7C34.5 5.6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

export function MicrosoftIcon() {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24">
      <path fill="#F25022" d="M0 0h11v11H0z" />
      <path fill="#7FBA00" d="M13 0h11v11H13z" />
      <path fill="#00A4EF" d="M0 13h11v11H0z" />
      <path fill="#FFB900" d="M13 13h11v11H13z" />
    </svg>
  )
}

/** "o continúa con" divider. */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-border-subtle" />
      <span className="text-label text-content-muted">{children}</span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  )
}
