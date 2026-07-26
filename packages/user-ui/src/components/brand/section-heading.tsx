import { cn } from "@academy/user-ui/lib/utils"
import { TitleSegment } from "@academy/user-ui/types/cms"
import { Fragment } from "react/jsx-runtime"

export interface RichTitleProps {
  segments: TitleSegment[]
  /**
   * Color for accent segment (rendered in Fraunces italic font)
   */
  accentClassName?: string
}

/**
 * Renders a CMS title where marked segments get the serif-italic
 * brand treatment ("Aprende *inglés* cuando y desde donde quieras")
 */
export function RichtTitle({
  segments,
  accentClassName = "text-academy-blue",
}: RichTitleProps) {
  return (
    <>
      {segments.map((segment, i) => (
        <Fragment key={i}>
          {segment.accent ? (
            <em
              className={cn("font-heading font-medium italic", accentClassName)}
            >
              {segment.text}
            </em>
          ) : (
            segment.text
          )}{" "}
        </Fragment>
      ))}
    </>
  )
}

export interface SectionHeadingProps extends Partial<RichTitleProps> {
  eyebrow?: string
  title: TitleSegment[]
  subtitle?: string
  align?: "left" | "center"
  eyebrowAlignment?: "left" | "center"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align,
  eyebrowAlignment,
  accentClassName,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-stack",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "text-xl font-bold tracking-tight-brand text-academy-coral",
            eyebrowAlignment === "center"
              ? "text-center mx-auto"
              : "text-left"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-section-title leading-display font-bold tracking-display text-content-primary">
        <RichtTitle segments={title} accentClassName={accentClassName} />
      </h2>
      {subtitle && (
        <p className="max-w-reading text-sm leading-body text-content-muted">
          {subtitle}
        </p>
      )}
    </header>
  )
}
