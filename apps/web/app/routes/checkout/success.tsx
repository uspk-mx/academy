import { loadOrderStatusLabels } from "@academy/cms/loaders/order-status"
import { orderStatus } from "@academy/courses-api/graphql/queries/orders"
import {
  CheckoutSuccessPage,
  type OrderStatus,
} from "@academy/user-ui/components/pages/checkout-success-page"
import { studentUrlFor } from "@academy/user-ui/lib/site-urls"
import { useEffect, useRef } from "react"
import { useRevalidator } from "react-router"
import type { Route } from "./+types/success"
import { usePostHog } from "@posthog/react"

export async function loader({ request, params }: Route.LoaderArgs) {
  const labels = await loadOrderStatusLabels(params.lang)
  const sessionId = new URL(request.url).searchParams.get("session_id")
  // No session (e.g. a free enrollment) → nothing to look up; show generic done.
  if (!sessionId) return { order: null, labels }

  try {
    // Public query — keyed on the unguessable session id, so it works logged-out
    // (an OXXO buyer returning from the voucher may have no session cookie).
    const data = await orderStatus({ request, variables: { sessionId } })
    return { order: data?.orderStatus ?? null, labels }
  } catch {
    return { order: null, labels }
  }
}

export default function CheckoutSuccess({
  params,
  loaderData,
}: Route.ComponentProps) {
  const { lang } = params
  const { order, labels } = loaderData
  const posthog = usePostHog()

  // Backend returns lowercase pending|completed|failed. With no order (free
  // enrollment / unknown session) fall back to a generic completed state.
  const status: OrderStatus = order
    ? (order.status.toLowerCase() as OrderStatus)
    : "completed"

  const completedFiredRef = useRef(false)
  useEffect(() => {
    if (status === "completed" && !completedFiredRef.current) {
      completedFiredRef.current = true
      posthog?.capture("checkout_completed", {
        item_count: order?.items?.length ?? 0,
      })
    }
  }, [status])

  // Poll while pending so a just-confirmed order flips to completed once its
  // webhook lands. Bounded on purpose: this only needs to cover the short
  // webhook lag (seconds). An OXXO voucher paid hours/days later won't complete
  // live — the buyer just reloads the page and the loader re-queries. Never
  // poll forever.
  const revalidator = useRevalidator()
  const revalidatorRef = useRef(revalidator)
  revalidatorRef.current = revalidator
  useEffect(() => {
    if (status !== "pending") return
    let polls = 0
    const id = setInterval(() => {
      if (polls >= 30) {
        clearInterval(id) // ~2 minutes, then give up quietly
        return
      }
      polls++
      if (revalidatorRef.current.state === "idle") {
        revalidatorRef.current.revalidate()
      }
    }, 4000)
    return () => clearInterval(id)
  }, [status])

  return (
    <CheckoutSuccessPage
      status={status}
      items={order?.items ?? undefined}
      coursesHref={studentUrlFor(lang, "/dashboard/courses")}
      homeHref={`/${lang}`}
      retryHref={`/${lang}/checkout`}
      labels={labels}
    />
  )
}
