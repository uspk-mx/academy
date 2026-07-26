import { cn } from "@academy/user-ui/lib/utils"
import { AudienceSegment, TeamMember } from "@academy/user-ui/types/cms"
import { IconQuote, IconQuoteFilled } from "@tabler/icons-react"
import { toneBg, toneFg, toneSoftBg } from "../brand/primitives"

/**
 * FounderQuote Component
 */
export function FounderQuote({
  quote,
  attribution,
  className,
}: {
  quote: string
  attribution: string
  className?: string
}) {
  return (
    <figure
      className={cn(
        "grid overflow-hidden rounded-card-lg border-2 border-border-strong bg-surface-card shadow-hard-md sm:grid-cols-[minmax(8rem,1fr)_3fr]",
        className
      )}
    >
      <div
        aria-hidden
        className="flex items-center justify-center bg-academy-blue p-card text-content-inverse max-sm:border-b-2 sm:border-r-2 sm:border-border-strong"
      >
        <IconQuoteFilled
          className="size-46 rotate-180"
        />
      </div>
      <div className="p-card flex flex-col items-start justify-between sm:p-stack-lg">
        <blockquote className="text-xl leading-body font-medium">
          {quote}
        </blockquote>
        <figcaption className="mt-stack text-lg font-bold">
          {attribution}
        </figcaption>
      </div>
    </figure>
  )
}

export function AudienceCard({
  segment,
  className,
}: {
  segment: AudienceSegment
  className?: string
}) {
  return (
    <article
      className={cn(
        "rounded-card border-2 border-border-strong p-card-sm shadow-hard-sm",
        toneBg[segment.tone],
        toneFg[segment.tone],
        className
      )}
    >
      <h3 className="inline-block rounded-sm bg-surface-card px-2 py-1 text-sm font-bold tracking-tight-brand text-content-primary">
        {segment.title}
      </h3>
      <p className="mt-stack text-label leading-body opacity-90">
        {segment.description}
      </p>
    </article>
  )
}

export function TeamMemberCard({
  member,
  className,
}: {
  member: TeamMember
  className?: string
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-stack rounded-card-lg border-2 border-border-strong p-card-sm shadow-hard-md",
        toneBg[member.tone],
        toneFg[member.tone],
        className
      )}
    >
      <div
        className={cn(
          "aspect-square w-full overflow-hidden rounded-card border-2 border-border-strong",
          toneSoftBg[member.tone]
        )}
      >
        {member.photo && (
          <img
            src={member.photo.url}
            alt={member.photo.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div>
        <h3 className="text-base font-bold tracking-tight-brand">
          {member.name}
        </h3>
        {member.role && <p className="text-label opacity-85">{member.role}</p>}
      </div>
    </article>
  )
}
