import { cn } from "@academy/user-ui/lib/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { ComponentProps, ReactNode } from "react"
import { Link } from "react-router"

type Variant = "promo" | "primary" | "secondary" | "outline" | "ink"
type Size = "sm" | "md" | "lg"

const variantClasses: Record<Variant, string> = {
  /** Yellow — hero / promo CTAs ("Ver cursos", "Comprar ahora"). */
  promo: "bg-action-promo text-content-primary",
  /** Green — success/commerce CTAs ("Ver más cursos", "Proceder a pagar"). */
  primary: "bg-action-primary text-content-inverse",
  /** Blue — secondary CTAs ("Empezar gratis", "Comprar $399 MX"). */
  secondary: "bg-action-secondary text-content-inverse",
  /** White with border ("Lección de prueba", "Añadir al carrito"). */
  outline: "bg-surface-card text-content-primary",
  ink: "bg-academy-ink text-content-inverse",
}

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-button border-2 border-border-strong font-bold tracking-tight-brand shadow-hard-xs transition-[translate,box-shadow] duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-hard-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-50"

interface BrandButtonBaseProps {
  variant?: Variant
  size?: Size
  withArrow?: boolean
  children?: ReactNode
  className?: string
}

export type BrandButtonProps = BrandButtonBaseProps &
  (
    | ({ to: string } & Omit<
        ComponentProps<typeof Link>,
        "to" | "className" | "children"
      >)
    | ({ to?: undefined } & Omit<
        ComponentProps<"button">,
        "className" | "children"
      >)
  )

/** CTA button with hard-shadow style. Renders a
 * React Router <Link> when `to` is provided, otherwise a <button>.
 */
export const BrandButton = ({
  variant = "promo",
  size = "md",
  withArrow = false,
  children,
  className,
  ...rest
}: BrandButtonProps) => {
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  )
  const content = (
    <>
      {children}
      {withArrow && (
        <IconArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
      )}
    </>
  )
  if ("to" in rest && rest.to !== undefined) {
    const { to, ...linkProps } = rest
    return (
      <Link to={to} className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  const buttonProps = rest as ComponentProps<"button">

  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      data-variant={variant}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
