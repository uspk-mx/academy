import { cn } from "@academy/user-ui/lib/utils"
import {
  PricingPlanContent,
  PricingSectionContent,
} from "@academy/user-ui/types/cms"
import { Pill } from "../brand/primitives"
import { IconCheck } from "@tabler/icons-react"
import { BrandButton } from "../brand/brand-button"
import { SectionHeading } from "../brand/section-heading"

export function PricingCard({
  plan,
  className,
}: {
  plan: PricingPlanContent
  className?: string
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-stack rounded-card-lg border-2 border-border-strong p-card",
        plan.highlighted
          ? "bg-academy-yellow shadow-hard-md lg:-my-stack lg:py-stack-lg"
          : "bg-surface-card shadow-hard-sm",
        className
      )}
    >
      {plan.highlighted && plan.highlightLabel && (
        <Pill
          tone="ink"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2"
        >
          {plan.highlightLabel}
        </Pill>
      )}

      <p className="font-heading text-card-title font-medium text-academy-blue italic">
        {plan.name}
      </p>
      <p className="flex items-baseline gap-2">
        <span className="text-page-title leading-display font-bold tracking-display">
          {plan.price}
        </span>
        <span className="text-label font-semibold text-content-muted uppercase">
          {plan.priceSuffix}
        </span>
      </p>

      <ul className="flex flex-1 flex-col gap-3 border-t border-border-strong/20 pt-stack">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm font-medium"
          >
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-sm border-2 border-border-strong bg-academy-green text-content-inverse">
              <IconCheck aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <BrandButton
        variant={plan.ctaTone === "yellow" ? "outline" : "secondary"}
        to={plan.cta.href}
        className="w-full"
      >
        {plan.cta.label}
      </BrandButton>
    </article>
  )
}

export interface PricingSectionProps {
  content: PricingSectionContent
  className?: string
}

export function PricingSection({ content, className }: PricingSectionProps) {
  if (!content.showPricingSection) return null
  return (
    <section
      id="precios"
      aria-labelledby="pricing-heading"
      className={cn(
        "mx-auto max-w-page border-t-2 border-border-strong px-page-x py-section-y",
        className
      )}
    >
      <span id="pricing-heading" className="sr-only">
        {content.eyebrow}
      </span>
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
      />
      <div className="mx-auto mt-stack-lg grid max-w-4xl items-stretch gap-stack-lg pt-stack lg:grid-cols-3 lg:gap-stack">
        {content.plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  )
}
