import {
  IconAlertTriangle,
  IconCircleCheck,
  IconRosette,
} from "@tabler/icons-react"
import { useState } from "react"

export interface SubscriptionView {
  id: string
  planName: string
  planDescription: string | null
  price: number
  /** ISO — the current period end (renewal or, if cancelling, access ends). */
  endDate: string
  cancelAtPeriodEnd: boolean | null
}

export interface StudentSubscriptionPageProps {
  subscription: SubscriptionView | null
  isCancelling?: boolean
  onCancel: (subscriptionId: string) => void
}

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})
const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

/**
 * "Mi Suscripción" — the learner's active subscription with a cancel action.
 * Cancelling is cancel-at-period-end: access lasts until `endDate`, then Stripe
 * stops renewing.
 */
export function StudentSubscriptionPage({
  subscription,
  isCancelling,
  onCancel,
}: StudentSubscriptionPageProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-yellow p-2">
            <IconRosette aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              Mi Suscripción
            </h1>
            <p className="text-sm text-content-muted">
              Gestiona tu membresía de Uspk Academy.
            </p>
          </div>
        </div>
      </header>

      {!subscription ? (
        <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
          <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
            <span className="flex size-16 items-center justify-center rounded-card border-2 border-border-strong bg-surface-muted">
              <IconRosette aria-hidden className="size-8 text-content-muted" />
            </span>
            <h2 className="text-card-title font-bold tracking-tight-brand">
              No tienes una suscripción activa
            </h2>
            <p className="text-content-muted">
              Al suscribirte, tu membresía aparecerá aquí para gestionarla.
            </p>
          </div>
        </div>
      ) : (
        <article className="overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-border-strong bg-academy-yellow-soft p-card">
            <div className="min-w-0">
              <h2 className="text-card-title font-bold tracking-tight-brand">
                {subscription.planName}
              </h2>
              {subscription.planDescription && (
                <p className="text-sm text-content-muted">
                  {subscription.planDescription}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-pill border-2 border-border-strong bg-surface-card px-3 py-1 text-sm font-bold tabular-nums">
              {money.format(subscription.price)}
            </span>
          </div>

          <div className="flex flex-col gap-stack p-card">
            {subscription.cancelAtPeriodEnd ? (
              <div className="flex items-start gap-3 rounded-card border-2 border-border-strong bg-academy-coral-soft p-4">
                <IconAlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-bold">Tu suscripción no se renovará</p>
                  <p className="text-sm text-content-muted">
                    Conservas acceso hasta el {formatDate(subscription.endDate)}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-card border-2 border-border-strong bg-academy-green-soft p-4">
                <IconCircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-bold">Suscripción activa</p>
                  <p className="text-sm text-content-muted">
                    Se renueva el {formatDate(subscription.endDate)}.
                  </p>
                </div>
              </div>
            )}

            {!subscription.cancelAtPeriodEnd &&
              (confirming ? (
                <div className="flex flex-col gap-2 rounded-card border-2 border-border-strong bg-surface-page p-4">
                  <p className="font-bold">¿Cancelar tu suscripción?</p>
                  <p className="text-sm text-content-muted">
                    No se hará ningún cobro más. Conservarás acceso hasta el{" "}
                    {formatDate(subscription.endDate)}.
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => onCancel(subscription.id)}
                      className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-coral px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-60"
                    >
                      {isCancelling ? "Cancelando…" : "Sí, cancelar"}
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setConfirming(false)}
                      className="rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                    >
                      Conservar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="self-start rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold text-academy-coral shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                >
                  Cancelar suscripción
                </button>
              ))}
          </div>
        </article>
      )}
    </div>
  )
}
