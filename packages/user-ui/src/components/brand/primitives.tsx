import { cn } from "@academy/user-ui/lib/utils"
import { formatMoney, formatPrice, Money } from "@academy/user-ui/types/api"
import { BrandTone } from "@academy/user-ui/types/cms"
import { IconStar } from "@tabler/icons-react"
import { ComponentProps, ReactNode } from "react"

// Tone map
export const toneBg: Record<BrandTone, string> = {
  yellow: "bg-academy-yellow",
  blue: "bg-academy-blue",
  green: "bg-academy-green",
  coral: "bg-academy-coral",
}

export const toneSoftBg: Record<BrandTone, string> = {
  yellow: "bg-academy-yellow-soft",
  blue: "bg-academy-blue-soft",
  green: "bg-academy-green-soft",
  coral: "bg-academy-coral-soft",
}

/** Text color that stays readable on the solid tone. */
export const toneFg: Record<BrandTone, string> = {
  yellow: "text-content-primary",
  blue: "text-content-inverse",
  green: "text-content-inverse",
  coral: "text-content-inverse",
}

// HardCard
type Shadow = "xs" | "sm" | "md" | "lg" | "none"

const shadowClass: Record<Shadow, string> = {
  xs: "shadow-hard-xs",
  sm: "shadow-hard-sm",
  md: "shadow-hard-md",
  lg: "shadow-hard-lg",
  none: "",
}

export interface HardCardProps {
  children: ReactNode
  shadow?: Shadow
  className?: string
  as?: "div" | "article" | "section" | "aside" | "li"
}

/**
 * The base neo brutalism surface: solid border + hard offset shadow
 */
export function HardCard({
  children,
  shadow,
  className,
  as: Tag = "div",
}: HardCardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border-2 border-border-strong bg-surface-card",
        shadowClass[shadow ?? "md"],
        className
      )}
    >
      {children}
    </Tag>
  )
}

/**
 * Pill Component
 */

type PillTone = "ink" | "white"

export interface PillProps {
  children: ReactNode
  tone?: BrandTone | PillTone
  outlined?: boolean
  className?: string
}

/** Small rounded label: course badges, level chips, promo tags. */
export function Pill({
  children,
  tone = "white",
  outlined = true,
  className,
}: PillProps) {
  const toneClasses =
    tone === "ink"
      ? "bg-academy-ink text-content-inverse"
      : tone === "white"
        ? "bg-surface-card text-content-primary"
        : cn(toneBg[tone], toneFg[tone])

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-label font-bold tracking-tight-brand",
        outlined && "border-2 border-border-strong",
        toneClasses,
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * Rating stars componet
 */

export interface RatingStarsProps {
  rating: number
  max?: number
  className?: string
}

export function RatingStars({ rating, max, className }: RatingStarsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Calificacion: ${rating} de ${max}`}
    >
      <span className="text-sm font-bold">{rating.toFixed(1)}</span>
      <span aria-hidden className="inline-flex gap-0.5 text-academy-coral">
        {Array.from({ length: max ?? 0 }, (_, i) => (
          <IconStar
            key={i}
            className={cn(
              "size-3.5",
              i < Math.round(rating) ? "fill-current" : "fill-transparent"
            )}
          />
        ))}
      </span>
    </span>
  )
}

/**
 * PriceTag component
 */
export interface PriceTagProps {
  /** Whole MXN, as returned by the courses API. */
  price: number
  compareAtPrice?: number
  discountPercent?: number
  className?: string
}

export function PriceTag({
  price,
  compareAtPrice,
  discountPercent,
  className,
}: PriceTagProps) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className
      )}
    >
      <span className="font-bold text-content-primary">
        {formatPrice(price)}
      </span>
      {compareAtPrice != null && (
        <s className="text-sm font-semibold text-academy-coral">
          {formatPrice(compareAtPrice)}
        </s>
      )}
      {typeof discountPercent === "number" && (
        <span className="ml-auto text-sm font-bold text-academy-coral">
          -{discountPercent}%
        </span>
      )}
    </p>
  )
}

/* ------------------------------- CoverFrame ------------------------------- */

export interface CoverFrameProps {
  imageUrl?: string | null
  /** Fallback glyph when there's no image — usually the course title's first letter. */
  fallback?: string
  tone: BrandTone
  className?: string
}

/**
 * The course-cover treatment shared by CourseCard and PurchaseCard:
 * white matte, hard border + shadow, 16:10 crop, slight tilt that
 * straightens when a parent `.group` is hovered.
 */
export function CoverFrame({
  imageUrl,
  fallback,
  tone,
  className,
}: CoverFrameProps) {
  return (
    <div
      className={cn(
        "-rotate-2 rounded-card border-2 border-border-strong bg-surface-card p-1 shadow-hard-xs transition-transform duration-200 ease-academy group-hover:rotate-0",
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="aspect-16/10 w-full rounded-[calc(var(--radius-card)-6px)] object-cover"
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "flex aspect-16/10 w-full items-center justify-center rounded-[calc(var(--radius-card)-6px)]",
            toneSoftBg[tone]
          )}
        >
          <span className="font-heading text-3xl font-medium italic">
            {fallback}
          </span>
        </div>
      )}
    </div>
  )
}
