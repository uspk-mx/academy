import { getSubscriptionPlans } from "@academy/courses-api/graphql/queries/subscription-plans"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import { getActiveUserSubscription } from "@academy/courses-api/graphql/student-app/queries/subscriptions"
import {
  MembershipsPage,
  type MembershipPlanView,
} from "@academy/user-ui/components/pages/memberships-page"
import { buildPageMeta } from "../lib/seo"
import type { Route } from "./+types/memberships"

export function meta({ params }: Route.MetaArgs) {
  return buildPageMeta({
    lang: params.lang,
    title: params.lang === "en" ? "Memberships" : "Membresías",
    description:
      params.lang === "en"
        ? "One membership, access to every Uspk Academy course. Cancel anytime."
        : "Una membresía, acceso a todos los cursos de Uspk Academy. Cancela cuando quieras.",
  })
}

export async function loader({ request }: Route.LoaderArgs) {
  let plans: MembershipPlanView[] = []
  try {
    const result = await getSubscriptionPlans(request)
    plans = (result?.subscriptionPlans ?? []).flatMap((plan) =>
      plan
        ? [
            {
              id: plan.id,
              name: plan.planName,
              description: plan.planDescription ?? null,
              price: plan.price,
              duration: plan.duration,
            },
          ]
        : []
    )
  } catch (error) {
    console.error("[memberships] failed to load plans:", error)
  }

  let hasActiveSubscription = false
  const me = await getMe(request)
  const userId = me?.me?.customerId
  if (userId) {
    const result = await getActiveUserSubscription(request, userId)
    hasActiveSubscription = !!result?.activeUserSubscription
  }

  return { plans, hasActiveSubscription }
}

export default function Memberships({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <MembershipsPage
      plans={loaderData.plans}
      lang={params.lang}
      hasActiveSubscription={loaderData.hasActiveSubscription}
    />
  )
}
