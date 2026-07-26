import { cn } from "@academy/user-ui/lib/utils"
import { HomeHeroContent, UnitTeaserContent } from "@academy/user-ui/types/cms"
import { IconFlame } from "@tabler/icons-react"
import { BrandButton } from "../brand/brand-button"
import { HardCard } from "../brand/primitives"
import { RichtTitle } from "../brand/section-heading"

/** Small floating color pills that decorate image cards across the site. */
export function FloatingPills({
  positions,
}: {
  positions: Array<{
    tone: "yellow" | "blue" | "green" | "coral"
    className: string
  }>
}) {
  const toneClass = {
    yellow: "bg-academy-yellow",
    blue: "bg-academy-blue",
    green: "bg-academy-green",
    coral: "bg-academy-coral",
  } as const

  return (
    <>
      {positions.map((pill, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "absolute h-4 w-10 rounded-pill border-2 border-border-strong",
            toneClass[pill.tone],
            pill.className
          )}
        />
      ))}
    </>
  )
}

export interface HomeHeroProps {
  content: HomeHeroContent
  className?: string
}

export function HomeHero({ content, className }: HomeHeroProps) {
  return (
    <section
      className={cn("mx-auto px-page-x py-stack md:py-section-y", className)}
    >
      <div className="grid items-center gap-stack-lg md:grid-cols-2">
        <div className="flex flex-col items-start gap-stack-lg">
          <h1 className="text-hero leading-display font-bold tracking-display">
            <RichtTitle segments={content.title} />
          </h1>
          <p className="max-w-md text-sm leading-body text-content-muted italic">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap gap-stack">
            <BrandButton variant="promo" size="lg" to={content.primaryCta.href}>
              {content.primaryCta.label}
            </BrandButton>
            <BrandButton
              variant="outline"
              size="lg"
              to={content.secondaryCta.href}
            >
              {content.secondaryCta.label}
            </BrandButton>
          </div>
          {content.disclaimer && (
            <p className="text-label text-content-muted">
              {content.disclaimer}
            </p>
          )}
        </div>

        <div className="relative">
          <FloatingPills
            positions={[
              { tone: "blue", className: "-top-2 right-8" },
              { tone: "coral", className: "top-1/3 -left-4" },
              { tone: "green", className: "-bottom-2 left-1/3" },
            ]}
          />
          <HardCard shadow="lg" className="overflow-hidden rounded-card-lg">
            <img
              src={content.image?.url}
              alt={content.image?.alt}
              width={content.image?.width}
              height={content.image?.height}
              className="aspect-4/3 w-full object-cover"
            />
          </HardCard>
        </div>
      </div>
      {content.unitTeaser && (
        <UnitTeaser content={content.unitTeaser} className="mt-section-y" />
      )}
    </section>
  )
}

export function UnitTeaser({
  content,
  className,
}: {
  content: UnitTeaserContent
  className?: string
}) {
  return (
    <div className={cn("relative mx-auto max-w-3xl", className)}>
      <div className="rounded-card-lg border-2 border-border-strong bg-academy-blue p-card text-content-inverse shadow-hard-md sm:p-stack-lg">
        <div className="flex flex-col items-center gap-stack-lg sm:flex-row">
          {/* Character card */}
          <div className="relative shrink-0">
            <FloatingPills
              positions={[
                { tone: "coral", className: "-left-5 bottom-4" },
                { tone: "green", className: "-right-5 bottom-8" },
              ]}
            />
            <div className="flex h-32 w-28 -skew-x-6 items-end justify-center overflow-hidden rounded-card border-2 border-border-strong bg-academy-yellow">
              {content.characterImage && (
                <img
                  src={content.characterImage.url}
                  alt={content.characterImage.alt}
                  className="h-full w-full scale-110 skew-x-6 object-contain object-bottom"
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-card-title font-bold">{content.unitLabel}</p>
            <p className="mt-1 text-lg font-bold tracking-tight-brand">
              {content.title}
            </p>
            <p className="mt-2 text-sm leading-body text-content-inverse/85">
              {content.description}
            </p>
          </div>
        </div>
      </div>

      {content.streakLabel && (
        <p className="absolute right-6 -bottom-4 inline-flex items-center gap-1 rounded-pill border-2 border-border-strong bg-academy-coral px-3 py-1 text-label font-bold text-content-inverse shadow-hard-xs">
          <IconFlame aria-hidden className="size-3.5 fill-current" />
          {content.streakLabel}
        </p>
      )}
    </div>
  )
}
