import { getMe } from "@academy/courses-api/graphql/queries/me"
import { createSubscriptionCheckout } from "@academy/courses-api/graphql/mutations/subscription-checkout"
import { getSubscriptionPlans } from "@academy/courses-api/graphql/queries/subscription-plans"
import {
  StripeElementsProvider,
  StripePaymentElement,
  StripePayButton,
} from "@academy/user-ui/components/checkout/stripe-checkout"
import { loginUrlFor } from "@academy/user-ui/lib/site-urls"
import { useEffect } from "react"
import { data, redirect, useFetcher, useNavigate } from "react-router"
import type { Route } from "./+types/subscribe"

import type { PostHogContext } from "../lib/posthog-middleware"
import { STRIPE_PUBLISHABLE_KEY } from "../lib/stripe"

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

export function meta() {
  return [{ title: "Uspk Academy | Suscribirme" }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const planId = url.searchParams.get("plan") ?? ""

  // Subscribing requires an account — bounce anonymous visitors to login and
  // back.
  const me = await getMe(request)
  if (!me?.me) {
    throw redirect(
      loginUrlFor({
        request,
        lang: params.lang,
        returnTo: `/${params.lang}/subscribe?plan=${planId}`,
      })
    )
  }

  const plansResult = await getSubscriptionPlans(request)
  const plan = (plansResult?.subscriptionPlans ?? []).find(
    (candidate) => candidate?.id === planId
  )
  if (!plan) throw redirect(`/${params.lang}/memberships`)

  return {
    planId,
    planName: plan.planName,
    planDescription: plan.planDescription ?? null,
    price: plan.price,
    duration: plan.duration,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    customerEmail: me.me.email ?? undefined,
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const form = await request.formData()
  const planId = String(form.get("planId") ?? "")
  if (!planId) return data({ error: "missingPlan" as const }, { status: 400 })

  const posthog = (context as PostHogContext).posthog

  try {
    const { data: result, setCookies } = await createSubscriptionCheckout({
      request,
      variables: { planId },
    })
    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)

    posthog?.capture({
      event: "subscription_checkout_started",
      properties: {
        plan_id: planId,
        session_id: result?.createSubscriptionCheckout.id ?? null,
      },
    })

    return data(
      {
        clientSecret: result?.createSubscriptionCheckout.clientSecret ?? null,
        sessionId: result?.createSubscriptionCheckout.id ?? null,
      },
      { headers }
    )
  } catch (error) {
    console.error("[subscribe] session creation failed:", error)
    return data({ error: "initError" as const }, { status: 500 })
  }
}

export default function Subscribe({ loaderData, params }: Route.ComponentProps) {
  const {
    planId,
    planName,
    planDescription,
    price,
    duration,
    publishableKey,
    customerEmail,
  } = loaderData
  const { lang } = params
  const navigate = useNavigate()
  const fetcher = useFetcher<typeof action>()

  // Create the subscription checkout session once, on mount.
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.submit({ planId }, { method: "post" })
    }
  }, [fetcher, planId])

  const clientSecret =
    fetcher.data && "clientSecret" in fetcher.data
      ? fetcher.data.clientSecret
      : null
  const sessionId =
    fetcher.data && "sessionId" in fetcher.data ? fetcher.data.sessionId : null
  const initError = Boolean(fetcher.data && "error" in fetcher.data)

  return (
    <div className="mx-auto grid max-w-4xl gap-stack-lg p-card md:grid-cols-2">
      <section className="rounded-card-lg border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
        <p className="font-heading text-card-title font-medium text-academy-blue italic">
          {planName}
        </p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-page-title leading-display font-bold tracking-display">
            {money.format(price)}
          </span>
          <span className="text-label font-semibold text-content-muted uppercase">
            {periodSuffix(duration)}
          </span>
        </p>
        {planDescription && (
          <p className="mt-stack text-sm text-content-muted">
            {planDescription}
          </p>
        )}
        <p className="mt-stack text-label text-content-muted">
          Se renueva automáticamente. Cancela cuando quieras desde tu panel.
        </p>
      </section>

      <section className="rounded-card-lg border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
        {initError ? (
          <div className="flex flex-col gap-3 text-center">
            <p className="font-bold text-academy-coral">
              No pudimos iniciar el pago.
            </p>
            <button
              type="button"
              onClick={() => fetcher.submit({ planId }, { method: "post" })}
              className="mx-auto rounded-button border-2 border-border-strong bg-academy-yellow px-5 py-2.5 font-bold shadow-hard-xs"
            >
              Reintentar
            </button>
          </div>
        ) : !clientSecret ? (
          <p className="py-8 text-center font-bold text-content-muted">
            Preparando el pago…
          </p>
        ) : (
          <StripeElementsProvider
            publishableKey={publishableKey}
            clientSecret={clientSecret}
          >
            <div className="flex flex-col gap-stack">
              <StripePaymentElement />
              <StripePayButton
                label={`Suscribirme · ${money.format(price)}${periodSuffix(duration)}`}
                processingLabel="Procesando…"
                email={customerEmail}
                errorFallback="No se pudo procesar el pago. Intenta de nuevo."
                onSuccess={() =>
                  navigate(
                    sessionId
                      ? `/${lang}/checkout/success?session_id=${sessionId}`
                      : `/${lang}/checkout/success`
                  )
                }
              />
            </div>
          </StripeElementsProvider>
        )}
      </section>
    </div>
  )
}
