import { cn } from "@academy/user-ui/lib/utils"
import {
  IconArrowLeft,
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconInfinity,
  IconRosette,
  IconStarFilled,
} from "@tabler/icons-react"
import { Link } from "react-router"
import { BrandButton } from "../brand/brand-button"
import { Pill } from "../brand/primitives"
import type { MembershipPlanView } from "./memberships-page"

export interface MembershipDetailsPageProps {
  plan: MembershipPlanView
  lang: string
}

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
})

function periodSuffix(duration: number): string {
  if (duration === 30 || duration === 31) return "/mes"
  if (duration === 365 || duration === 366) return "/año"
  if (duration === 7) return "/semana"
  return ` cada ${duration} días`
}

// ── Static marketing copy (edit here; move to CMS later) ─────────────────────
const STATS = [
  { value: "500+", label: "cursos disponibles" },
  { value: "2,000+", label: "ejercicios prácticos" },
  { value: "4.8", label: "calificación promedio", star: true },
  { value: "80+", label: "instructores expertos" },
]

const FEATURES = [
  {
    eyebrow: "Siempre al día",
    title: "Habilidades actuales para mantenerte competitivo",
    body: "Aprende con cursos actualizados en los temas más demandados: inglés, tecnología, negocios, diseño y más.",
    tone: "bg-academy-coral",
    icon: IconBolt,
  },
  {
    eyebrow: "Flexible",
    title: "Libertad para explorar y descubrir",
    body: "Cambia de tema cuando quieras y aprende a tu ritmo. Tu membresía te da acceso a toda la colección incluida en el plan.",
    tone: "bg-academy-blue",
    icon: IconInfinity,
  },
]

const FAQS = [
  {
    q: "¿Qué es esta membresía?",
    a: "Una suscripción que te da acceso a la colección de cursos incluida en el plan, mientras esté activa. Un solo pago recurrente en lugar de comprar curso por curso.",
  },
  {
    q: "¿En qué se diferencia de comprar un curso?",
    a: "Comprar un curso es un pago único y ese curso es tuyo. La membresía te da acceso a muchos cursos por una cuota recurrente; el acceso dura mientras la suscripción esté activa.",
  },
  {
    q: "¿Cómo y cuándo se me cobra?",
    a: "Se cobra al suscribirte y luego se renueva automáticamente al inicio de cada periodo, con el método de pago que registraste.",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Desde tu panel, en 'Mi Suscripción', puedes cancelar cuando quieras. Conservas el acceso hasta el final del periodo que ya pagaste y no se hacen más cobros.",
  },
]

/**
 * The rich, per-plan landing (like Udemy's `/personal-plan/`): a hero for one
 * plan with a subscribe CTA, stats, features and FAQ. Reached from the
 * memberships comparison via "Ver detalles". Marketing copy is static.
 */
export function MembershipDetailsPage({
  plan,
  lang,
}: MembershipDetailsPageProps) {
  const subscribeHref = `/${lang}/subscribe?plan=${plan.id}`
  return (
    <div className="flex flex-col">
      <section className="border-b-2 border-border-strong bg-surface-page">
        <div className="mx-auto max-w-page px-page-x pt-stack-lg">
          <Link
            to={`/${lang}/memberships`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-content-muted hover:text-content-primary"
          >
            <IconArrowLeft aria-hidden className="size-4" />
            Todas las membresías
          </Link>
        </div>
        <div className="mx-auto grid max-w-page items-center gap-stack-lg px-page-x pt-stack pb-section-y md:grid-cols-2">
          <div>
            <Pill tone="ink">Membresía</Pill>
            <h1 className="mt-stack text-hero leading-display font-bold tracking-display">
              {plan.name}
            </h1>
            <p className="mt-stack flex items-baseline gap-2">
              <span className="text-page-title leading-display font-bold tracking-display">
                {money.format(plan.price)}
              </span>
              <span className="text-label font-semibold text-content-muted uppercase">
                {periodSuffix(plan.duration)}
              </span>
            </p>
            {plan.description && (
              <p className="mt-stack max-w-md text-lg text-content-muted">
                {plan.description}
              </p>
            )}
            <div className="mt-stack-lg flex flex-wrap gap-3">
              <BrandButton variant="secondary" to={subscribeHref}>
                Suscribirme
              </BrandButton>
              <BrandButton variant="outline" to="#faq">
                Preguntas frecuentes
              </BrandButton>
            </div>
            <p className="mt-stack text-label text-content-muted">
              Se renueva automáticamente. Cancela cuando quieras.
            </p>
          </div>

          <div
            className="hidden aspect-[4/3] rounded-card-lg border-2 border-border-strong shadow-hard-md md:block"
            style={{
              background:
                "repeating-linear-gradient(45deg, #FFD123 0 48px, #FFE79C 48px 96px)",
            }}
            aria-hidden
          >
            <div className="flex size-full items-center justify-center">
              <span className="flex size-24 items-center justify-center rounded-card border-2 border-border-strong bg-surface-card shadow-hard-sm">
                <IconRosette className="size-12" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-border-strong bg-surface-card">
        <div className="mx-auto grid max-w-page grid-cols-2 gap-stack px-page-x py-section-y lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-page-title leading-display font-bold tracking-display">
                {stat.value}
                {stat.star && (
                  <IconStarFilled className="size-6 text-academy-yellow" />
                )}
              </p>
              <p className="mt-1 text-sm text-content-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-page px-page-x py-section-y">
        <div className="flex flex-col gap-section-y">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={cn(
                  "grid items-center gap-stack-lg md:grid-cols-2",
                  index % 2 === 1 && "md:[&>*:first-child]:order-2"
                )}
              >
                <div
                  className={cn(
                    "flex aspect-video items-center justify-center rounded-card-lg border-2 border-border-strong shadow-hard-sm",
                    feature.tone
                  )}
                  aria-hidden
                >
                  <Icon className="size-16 text-content-inverse" />
                </div>
                <div>
                  <p className="text-label font-bold text-content-muted uppercase">
                    {feature.eyebrow}
                  </p>
                  <h2 className="mt-2 text-section-title leading-display font-bold tracking-display">
                    {feature.title}
                  </h2>
                  <p className="mt-stack text-content-muted">{feature.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-y-2 border-border-strong bg-surface-page">
        <div className="mx-auto flex max-w-page flex-col items-center gap-stack px-page-x py-section-y text-center">
          <h2 className="text-section-title leading-display font-bold tracking-display">
            Empieza a aprender hoy
          </h2>
          <p className="max-w-md text-content-muted">
            Suscríbete a {plan.name} y accede a toda la colección de cursos.
          </p>
          <BrandButton variant="secondary" to={subscribeHref}>
            Suscribirme · {money.format(plan.price)}
            {periodSuffix(plan.duration)}
          </BrandButton>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24">
        <div className="mx-auto max-w-3xl px-page-x py-section-y">
          <h2 className="text-section-title leading-display font-bold tracking-display">
            Preguntas frecuentes
          </h2>
          <div className="mt-stack-lg flex flex-col">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group border-t-2 border-border-strong py-4 last:border-b-2"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <IconChevronDown
                    aria-hidden
                    className="size-5 shrink-0 transition-transform duration-150 ease-academy group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-content-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
