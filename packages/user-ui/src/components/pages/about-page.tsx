import { AboutContent, CtaBannerContent } from "@academy/user-ui/types/cms"
import { FloatingPills } from "../marketing/home-hero"
import { HardCard } from "../brand/primitives"
import {
  AudienceCard,
  FounderQuote,
  TeamMemberCard,
} from "../about/about-cards"
import { CtaBanner } from "../marketing/banners"
import { Separator } from "../ui/separator"

export interface AboutPageProps {
  content: AboutContent
  ctaBanner: CtaBannerContent
}

export function AboutPage({ content, ctaBanner }: AboutPageProps) {
  return (
    <main className="bg-surface-page">
      <div className="mx-auto max-w-page px-page-x py-stack-lg md:py-section-y">
        <section className="grid items-center gap-stack-lg md:grid-cols-2">
          <div>
            <h1 className="text-page-title leading-display font-bold tracking-display">
              {content.title}
            </h1>
            <p className="mt-stack-lg max-w-md text-base leading-body text-content-muted">
              {content.body}
            </p>
          </div>
          <div className="relative">
            <FloatingPills
              positions={[
                { tone: "blue", className: "-top-2 right-10" },
                { tone: "coral", className: "top-1/3 -left-4" },
                { tone: "green", className: "-bottom-2 right-1/4" },
              ]}
            />
            <HardCard shadow="md" className="overflow-hidden rounded-card-lg">
              <img
                src={content.image.url}
                alt={content.image.alt}
                className="aspect-4/3 w-full object-cover"
              />
            </HardCard>
          </div>
        </section>

        <FounderQuote
          quote={content.founderQuote.quote}
          attribution={content.founderQuote.attribution}
          className="mt-section-y"
        />

        <section className="mt-section-y grid gap-stack-lg md:grid-cols-2">
          {[content.history, content.mission].map((block) => (
            <article key={block.title}>
              <h2 className="text-section-title leading-display font-bold tracking-display">
                {block.title}
              </h2>
              <p className="mt-stack max-w-md text-base leading-body text-content-muted">
                {block.body}
              </p>
            </article>
          ))}
        </section>
      </div>

      <Separator className="h-0.5! bg-academy-ink" />
      <section aria-labelledby="audience-heading" className="py-section-y">
        <div className="mx-auto grid max-w-page items-center gap-stack-lg px-page-x md:grid-cols-[1fr_1.5fr]">
          <div>
            <h2
              id="audience-heading"
              className="text-section-title leading-display font-bold tracking-display"
            >
              {content.audience.title}
            </h2>
            <p className="mt-stack max-w-xs text-sm leading-body text-content-muted">
              {content.audience.description}
            </p>
          </div>
          <div className="grid gap-stack sm:grid-cols-2">
            {content.audience.segments.map((segment) => (
              <AudienceCard key={segment.id} segment={segment} />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="team-heading"
        className="mx-auto max-w-page px-page-x py-section-y"
      >
        <h2
          id="team-heading"
          className="text-center text-section-title leading-display font-bold tracking-display"
        >
          {content.team.title}
        </h2>
        <div className="mx-auto mt-stack-lg grid max-w-3xl gap-stack-lg sm:grid-cols-3">
          {content.team.members
            .sort((item) => item.order ?? 1)
            .map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
        </div>
      </section>

      <CtaBanner content={ctaBanner} />
    </main>
  )
}
