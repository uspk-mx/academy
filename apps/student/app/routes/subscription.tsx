import { getMe } from "@academy/courses-api/graphql/queries/me"
import { cancelUserSubscription } from "@academy/courses-api/graphql/student-app/mutations/subscriptions"
import { getActiveUserSubscription } from "@academy/courses-api/graphql/student-app/queries/subscriptions"
import {
  StudentSubscriptionPage,
  type SubscriptionView,
} from "@academy/student-ui/components/pages/subscription-page"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { data, useFetcher } from "react-router"
import type { Route } from "./+types/subscription"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Mi Suscripción" },
    { name: "description", content: "Gestiona tu suscripción de Uspk Academy." },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const me = await getMe(request)
  const userId = me?.me?.customerId
  if (!userId) throw new Response("Not Found", { status: 404 })

  const result = await getActiveUserSubscription(request, userId)
  const raw = result?.activeUserSubscription

  const subscription: SubscriptionView | null = raw
    ? {
        id: raw.id,
        planName: raw.plan?.planName ?? "Suscripción",
        planDescription: raw.plan?.planDescription ?? null,
        price: raw.plan?.price ?? 0,
        endDate: raw.endDate ?? "",
        cancelAtPeriodEnd: raw.cancelAtPeriodEnd ?? null,
      }
    : null

  return { subscription }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const subscriptionId = String(form.get("subscriptionId") ?? "")
  if (!subscriptionId) return data({ error: "missing" }, { status: 400 })

  try {
    const { setCookies } = await cancelUserSubscription({
      request,
      variables: { subscriptionId },
    })
    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return data({ ok: true }, { headers })
  } catch (error) {
    console.error("[subscription] cancel failed:", error)
    return data({ error: "generic" }, { status: 500 })
  }
}

export default function Subscription({ loaderData }: Route.ComponentProps) {
  const { subscription } = loaderData
  const fetcher = useFetcher()

  return (
    <StudentSubscriptionPage
      subscription={subscription}
      isCancelling={fetcher.state !== "idle"}
      onCancel={(subscriptionId) =>
        fetcher.submit({ subscriptionId }, { method: "post" })
      }
    />
  )
}
