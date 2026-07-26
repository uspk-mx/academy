import { FeatureItem, FeaturesSectionContent } from "@academy/user-ui/types/cms"
import {
  IconAward,
  IconChartBar,
  IconGlobe,
  IconHeadphones,
  TablerIcon,
  IconBolt,
} from "@tabler/icons-react"
import { HardCard, toneBg, toneFg } from "../brand/primitives"
import { cn } from "@academy/user-ui/lib/utils"
import { SectionHeading } from "../brand/section-heading"

const iconMap: Record<FeatureItem["icon"], TablerIcon> = {
  zap: IconBolt,
  "bar-chart": IconChartBar,
  globe: IconGlobe,
  award: IconAward,
  headphones: IconHeadphones,
}

export function FeatureCard({
  item,
  className,
}: {
  item: FeatureItem
  className?: string
}) {
  const Icon = iconMap[item.icon]
  return (
    <HardCard
      as="article"
      className={cn("flex flex-col gap-stack p-card", className)}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-button border-2 border-border-strong shadow-hard-xs",
          toneBg[item.tone],
          toneFg[item.tone]
        )}
      >
        <Icon aria-hidden className="size-5" strokeWidth={2.5} />
      </div>

      <p className="text-label font-bold tracking-tight-brand text-content-muted uppercase">
        {item.eyebrow}
      </p>
      <h3 className="text-card-title font-bold tracking-tight-brand">
        {item.title}
      </h3>
      <p className="text-sm leading-body text-content-muted">
        {item.description}
      </p>
    </HardCard>
  )
}

export interface FeaturesSectionProps {
  content: FeaturesSectionContent
  className?: string
}

export const FeaturesSection = ({
  content,
  className,
}: FeaturesSectionProps) => {
  const [firstRow, secondRow] = [
    content.items.slice(0, 3),
    content.items.slice(3),
  ]

  return (
    <section
      aria-labelledby="features-heading"
      className={cn(
        "mx-auto max-w-page border-t-2 border-border-strong px-page-x py-section-y",
        className
      )}
    >
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        align="center"
        eyebrowAlignment="center"
        className="[&_h2]:max-w-2xl [&_h2]:text-left"
      />
      <span id="features-heading" className="sr-only">
        {content.eyebrow}
      </span>
      <div className="mt-stack-lg grid gap-stack sm:grid-cols-2 lg:grid-cols-3">
        {firstRow.map((item) => (
          <FeatureCard key={item.id} item={item} />
        ))}
      </div>
      {secondRow.length > 0 && (
        <div className="mt-stack grid gap-stack sm:grid-cols-2">
          {secondRow.map((item) => (
            <FeatureCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
