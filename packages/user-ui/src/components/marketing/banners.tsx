import { cn } from "@academy/user-ui/lib/utils"
import {
  CtaBannerContent,
  LogoStripContent,
  Testimonial,
} from "@academy/user-ui/types/cms"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { BrandButton } from "../brand/brand-button"

/**
 * LogoStrip Component
 */
export function LogoStrip({
  content,
  className,
}: {
  content: LogoStripContent
  className?: string
}) {
  if (!content.showCompaniesSection) return null
  return (
    <section
      aria-label={content.title}
      className={cn("mx-auto max-w-page px-page-x", className)}
    >
      <p className="text-center text-xl font-bold tracking-tight-brand text-academy-coral">
        {content.title}
      </p>
      <ul className="mt-stack-lg flex flex-wrap items-center justify-center gap-x-stack-lg gap-y-stack">
        {content.logos.map((logo) => (
          <li key={logo.url}>
            <img
              src={logo.url}
              alt={logo.alt}
              loading="lazy"
              className="h-10 w-auto object-contain grayscale-0 sm:h-12"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * TestimonialBanner
 */

export function TestimonialBanner({
  testimonial,
  className,
}: {
  testimonial: Testimonial
  className?: string
}) {
  if (!testimonial.showTestimonialsSection) return null
  return (
    <section
      aria-label="Testimonio"
      className={cn("mx-auto max-w-page px-page-x", className)}
    >
      <figure className="rounded-card-lg border-2 border-border-strong bg-academy-ink p-card text-content-inverse shadow-hard-md sm:p-stack-lg">
        <blockquote className="text-lg leading-body font-bold tracking-tight-brand sm:text-xl">
          “{testimonial.quote}”{" "}
          {testimonial.quoteEmphasis && (
            <em className="font-heading font-medium italic">
              {testimonial.quoteEmphasis}
            </em>
          )}
        </blockquote>
        <figcaption className="mt-stack-lg flex items-center gap-stack">
          {testimonial.avatar && (
            <img
              src={testimonial.avatar.url}
              alt=""
              className="size-11 rounded-pill border-2 border-academy-yellow object-cover"
            />
          )}
          <div>
            <p className="text-sm font-bold">{testimonial.authorName}</p>
            <p className="font-heading text-sm text-content-inverse/70 italic">
              {testimonial.authorRole}
            </p>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}

/**
 * CTA Banner
 */
/** Social links for the CTA banner (edit here; brand-colored icons). */
const CTA_SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/uspkacademy",
    icon: IconBrandInstagram,
    color: "text-[#E4405F]",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/520000000000",
    icon: IconBrandWhatsapp,
    color: "text-[#25D366]",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@uspkacademy",
    icon: IconBrandTiktok,
    color: "text-content-primary",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/uspkacademy",
    icon: IconBrandFacebook,
    color: "text-[#1877F2]",
  },
]

/** Yellow "Upskill. Onboard. Lead. Repeat." band used on Nosotros and Blog.
 *  Right rail is a lighter panel whose portraits scroll in a vertical marquee. */
export function CtaBanner({
  content,
  className,
}: {
  content: CtaBannerContent
  className?: string
}) {
  const portraits = content.portraits ?? []
  return (
    <section
      aria-labelledby="cta-banner-heading"
      className={cn("overflow-hidden bg-surface-promo", className)}
    >
      <div className="flex items-stretch">
        <div className="mx-auto flex max-h-192 max-w-page flex-1 flex-col items-start gap-stack-lg px-page-x py-section-y lg:grid lg:grid-cols-2 lg:items-center">
          <div className="flex w-full flex-col items-start gap-stack-lg md:w-2xl lg:w-full">
            <h2
              id="cta-banner-heading"
              className="w-full rounded-card border-2 border-border-strong bg-surface-page p-card text-page-title leading-display font-bold tracking-display shadow-hard-md"
            >
              {content.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <ul className="flex w-fit items-center gap-4 rounded-card border-2 border-border-strong bg-surface-page px-4 py-3 shadow-hard-sm">
              {CTA_SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "block transition-transform duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                      social.color
                    )}
                  >
                    <social.icon className="size-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col items-center gap-stack lg:mx-auto lg:max-w-sm lg:text-center">
            <p className="text-lg leading-body font-medium">
              {content.description}
            </p>
            <div className="flex w-full flex-col gap-stack md:mr-auto md:max-w-lg md:flex-row lg:mr-0 lg:max-w-52 lg:flex-col">
              <BrandButton
                variant="secondary"
                to={content.primaryCta.href}
                className="w-full"
              >
                {content.primaryCta.label}
              </BrandButton>
              <BrandButton
                variant="outline"
                to={content.secondaryCta.href}
                className="w-full"
              >
                {content.secondaryCta.label}
              </BrandButton>
            </div>
          </div>
        </div>

        {portraits.length > 0 && (
          <div
            className="relative hidden w-70 shrink-0 overflow-hidden border-l-2 border-border-strong bg-academy-yellow-soft lg:block"
            aria-hidden
          >
            {/* Duplicated list so the -50% marquee loops seamlessly. */}
            <ul className="flex animate-[cta-portrait-marquee_16s_linear_infinite] flex-col items-center motion-reduce:animate-none">
              {[...portraits].map((portrait, index) => (
                <li key={index} className="mb-stack">
                  <img
                    src={portrait.url}
                    alt=""
                    loading="lazy"
                    className="size-52 rounded-pill border-2 border-border-strong object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * PromoBar Component
 */

export interface PromoBarProps {
  message: string // "Este precio tiene las horas contadas..."
  endsAt: string // ISO datetime
  bgColor: string
  onDismiss?: () => void
  className?: string
  showTimer?: boolean
}

/** Coral countdown bar shown above the header on cart/checkout flows. */
export function PromoBanner({
  message,
  endsAt,
  onDismiss,
  className,
  bgColor,
  showTimer = true,
}: PromoBarProps) {
  const [parts, setParts] = useState<{
    hours: string
    minutes: string
    seconds: string
  } | null>(null)

  useEffect(() => {
    if (!showTimer) return
    const end = new Date(endsAt).getTime()
    function tick() {
      const diff = end - Date.now()
      if (diff <= 0) {
        setParts(null)
        return
      }
      const pad = (n: number) => n.toString().padStart(2, "0")
      setParts({
        hours: pad(Math.floor(diff / 3_600_000)),
        minutes: pad(Math.floor((diff % 3_600_000) / 60_000)),
        seconds: pad(Math.floor((diff % 60_000) / 1000)),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (!parts) return null
  return (
    <aside
      className={cn(
        "flex items-center justify-between gap-stack border-b-2 border-border-strong bg-academy-coral px-page-x py-3 text-content-inverse",
        className
      )}
      style={{ background: bgColor }}
    >
      <p className="text-sm font-bold tracking-tight-brand sm:text-base">
        {message}
      </p>

      {showTimer && (
        <div className="flex items-center gap-stack">
          <p className="text-lg font-bold tracking-tight-brand tabular-nums sm:text-xl">
            <span aria-hidden>
              {parts.hours}: {parts.minutes}: {parts.seconds}
            </span>
            <span className="sr-only">
              Quedan {parts.hours} horas, {parts.minutes} minutos y{" "}
              {parts.seconds} segundos
            </span>
          </p>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Cerrar aviso"
              className="rounded-sm p-1 hover:bg-academy-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-inverse"
            >
              <IconX aria-hidden className="size-5" />
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
