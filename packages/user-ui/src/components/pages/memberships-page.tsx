import { cn } from "@academy/user-ui/lib/utils"
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconMinus,
} from "@tabler/icons-react"
import { Link } from "react-router"
import { BrandButton } from "../brand/brand-button"
import { Pill } from "../brand/primitives"

export interface MembershipPlanView {
  id: string
  name: string
  description: string | null
  price: number
  /** Access length in days — turned into a "/mes" · "/año" · "cada N días" suffix. */
  duration: number
}

export interface MembershipsPageProps {
  plans: MembershipPlanView[]
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

// ── Static config (edit here; B2B lives in a separate app, so Team/Enterprise
// are lead-gen via email) ────────────────────────────────────────────────────
const SALES_EMAIL = "ventas@uspkacademy.com"

const mailtoBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-5 py-2.5 font-bold tracking-tight-brand shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"

/** Compare matrix — `true`/`false` render a check/dash; a string renders as-is.
 *  Columns are [Personal, Team, Enterprise]. */
const COMPARE: {
  section: string
  rows: {
    label: string
    cells: [boolean | string, boolean | string, boolean | string]
  }[]
}[] = [
  {
    section: "Experiencia del alumno",
    rows: [
      {
        label: "Cursos destacados",
        cells: ["500+", "500+", "500+ (incl. especializados)"],
      },
      {
        label: "Cursos de preparación de certificación",
        cells: [true, true, true],
      },
      { label: "Ejercicios con IA", cells: [true, true, true] },
      { label: "Recomendaciones personalizadas", cells: [true, true, true] },
      { label: "Preguntas al instructor", cells: [true, true, true] },
      { label: "Acceso desde la app móvil", cells: [true, true, true] },
    ],
  },
  {
    section: "Experiencia de administrador",
    rows: [
      { label: "Reportes de adopción y progreso", cells: [false, true, true] },
      { label: "Gestión de equipo", cells: [false, true, true] },
      { label: "Analíticas avanzadas", cells: [false, false, true] },
      { label: "Éxito del cliente dedicado", cells: [false, false, true] },
      { label: "Contenido personalizable", cells: [false, false, true] },
    ],
  },
]

const FAQS = [
  {
    q: "¿En qué se diferencia una membresía de comprar un curso?",
    a: "Comprar un curso es un pago único y ese curso es tuyo para siempre. La membresía es una suscripción recurrente que te da acceso a toda la colección incluida en el plan, mientras esté activa.",
  },
  {
    q: "¿Cómo se seleccionan los cursos de cada plan?",
    a: "Cada plan incluye una colección curada de cursos. El plan Personal da acceso a la colección incluida; los planes de equipo y organización amplían el acceso y las herramientas de administración.",
  },
  {
    q: "¿Cómo y cuándo se me cobra?",
    a: "El plan Personal se cobra al suscribirte y se renueva automáticamente cada periodo. Para Team y Enterprise, el equipo de ventas define la facturación (normalmente anual).",
  },
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Desde tu panel, en 'Mi Suscripción', puedes cancelar cuando quieras. Conservas el acceso hasta el final del periodo que ya pagaste y no se hacen más cobros.",
  },
  {
    q: "¿Cuál es la diferencia entre Team y Enterprise?",
    a: "Team es para equipos de 2 a 50 personas con reportes y gestión básica. Enterprise es para organizaciones más grandes, con analíticas avanzadas, contenido personalizable y un equipo de éxito dedicado.",
  },
]

/**
 * "Membresías" — the plan-selection page (like Udemy's "Choose a plan"): three
 * tiers (Personal / Team / Enterprise) plus a compare matrix. Personal is the
 * real B2C subscription (live data → checkout); Team & Enterprise are B2B,
 * which lives in a separate app, so they're lead-gen via email.
 */
export function MembershipsPage({ plans, lang }: MembershipsPageProps) {
  // The cheapest live plan represents the individual "Personal" tier.
  const personal = [...plans].sort((a, b) => a.price - b.price)[0] ?? null

  return (
    <div className="flex flex-col">
      <div className="mx-auto max-w-2xl px-page-x pt-section-y text-center">
        <h1 className="text-page-title leading-display font-bold tracking-display">
          Elige un plan para tu éxito
        </h1>
        <p className="mt-stack text-lg text-content-muted">
          ¿No quieres comprar curso por curso? Elige un plan para ti, tu equipo
          o tu organización.
        </p>
      </div>

      <Tiers personal={personal} lang={lang} />
      <CompareTable />
      <Faq />
    </div>
  )
}

function Faq() {
  return (
    <section className="border-t-2 border-border-strong">
      <div className="mx-auto max-w-3xl px-page-x py-section-y">
        <h2 className="text-center text-section-title leading-display font-bold tracking-display">
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
  )
}

function Tiers({
  personal,
  lang,
}: {
  personal: MembershipPlanView | null
  lang: string
}) {
  return (
    <section className="sm:mx-auto grid max-w-page items-stretch gap-stack-lg px-page-x py-section-y sm:grid-cols-2 lg:grid-cols-3 lg:gap-stack">
      {/* Personal — real subscription */}
      <TierCard
        name="Personal"
        audience="Para ti · Individual"
        highlighted
        price={
          personal ? (
            <>
              {money.format(personal.price)}
              <span className="text-label font-semibold text-content-muted uppercase">
                {" "}
                {periodSuffix(personal.duration)}
              </span>
            </>
          ) : (
            "Próximamente"
          )
        }
        note="Facturación recurrente. Cancela cuando quieras."
        features={[
          "Acceso a los cursos del plan",
          "Certificados al completar",
          "Recomendaciones personalizadas",
          "Cancela cuando quieras",
        ]}
        cta={
          personal ? (
            <BrandButton
              variant="secondary"
              to={`/${lang}/subscribe?plan=${personal.id}`}
              className="w-full"
              withArrow
            >
              Empezar suscripción
            </BrandButton>
          ) : (
            <span className={cn(mailtoBtn, "cursor-not-allowed opacity-60")}>
              Próximamente
            </span>
          )
        }
        detailsHref={personal ? `/${lang}/memberships/${personal.id}` : null}
      />

      {/* Team — B2B, lead-gen */}
      <TierCard
        name="Team"
        audience="Para tu equipo · 2 a 50 personas"
        price="Contacta ventas"
        note="Facturación anual. Cancela cuando quieras."
        features={[
          "Todo lo de Personal",
          "Reportes de adopción y progreso",
          "Gestión de equipo",
          "Facturación centralizada",
        ]}
        cta={
          <a
            href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent("Interés en Team Plan")}`}
            className={mailtoBtn}
          >
            Contactar ventas
          </a>
        }
      />

      {/* Enterprise — B2B, lead-gen */}
      <TierCard
        name="Enterprise"
        audience="Para tu organización · Más de 20 personas"
        price="Precio personalizado"
        note="Contacta ventas para una cotización."
        features={[
          "Todo lo de Team",
          "Analíticas avanzadas",
          "Éxito del cliente dedicado",
          "Contenido personalizable",
        ]}
        cta={
          <a
            href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent("Solicitud de demo Enterprise")}`}
            className={mailtoBtn}
          >
            Solicita una demo
          </a>
        }
      />
    </section>
  )
}

function TierCard({
  name,
  audience,
  price,
  note,
  features,
  cta,
  highlighted,
  detailsHref,
}: {
  name: string
  audience: string
  price: React.ReactNode
  note: string
  features: string[]
  cta: React.ReactNode
  highlighted?: boolean
  detailsHref?: string | null
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-card-lg border-2 border-border-strong bg-surface-card",
        highlighted ? "shadow-hard-md" : "shadow-hard-sm"
      )}
    >
      {highlighted && (
        <Pill tone="ink" className="absolute top-4 right-4 z-10">
          Mejor valor
        </Pill>
      )}
      <div
        className={cn(
          "border-b-2 border-border-strong p-card",
          highlighted ? "bg-academy-yellow" : "bg-surface-muted"
        )}
      >
        <h3 className="text-card-title font-bold tracking-tight-brand">
          {name}
        </h3>
        <p className="text-sm text-content-muted">{audience}</p>
      </div>

      <div className="flex flex-1 flex-col gap-stack p-card">
        <p className="text-section-title leading-display font-bold tracking-display">
          {price}
        </p>
        {cta}
        <p className="text-label text-content-muted">{note}</p>

        <ul className="flex flex-1 flex-col gap-3 border-t border-border-strong/20 pt-stack">
          {features.map((feature) => (
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

        {detailsHref && (
          <Link
            to={detailsHref}
            className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            Ver detalles
            <IconArrowRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>
    </article>
  )
}

function CompareTable() {
  const columns = ["Personal", "Team", "Enterprise"]
  return (
    <section className="border-t-2 border-border-strong bg-surface-page">
      <div className="mx-auto max-w-page px-page-x py-section-y">
        <h2 className="text-section-title leading-display font-bold tracking-display">
          Compara los planes
        </h2>

        <div className="mt-stack-lg overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-1/3 p-3" />
                {columns.map((column) => (
                  <th
                    key={column}
                    className="p-3 text-center text-card-title font-bold tracking-tight-brand"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((group) => (
                <FeatureGroup key={group.section} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function FeatureGroup({ group }: { group: (typeof COMPARE)[number] }) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="border-y-2 border-border-strong bg-surface-muted p-3 font-bold"
        >
          {group.section}
        </td>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.label} className="border-b border-border-strong/20">
          <td className="p-3 text-sm font-medium">{row.label}</td>
          {row.cells.map((cell, index) => (
            <td key={index} className="p-3 text-center">
              <Cell value={cell} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-bold tabular-nums">{value}</span>
  }
  return value ? (
    <span className="mx-auto flex size-5 items-center justify-center rounded-sm border-2 border-border-strong bg-academy-green text-content-inverse">
      <IconCheck aria-hidden className="size-3" strokeWidth={3} />
    </span>
  ) : (
    <IconMinus aria-hidden className="mx-auto size-4 text-content-muted" />
  )
}
