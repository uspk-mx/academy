import { getSubscriptionPlans } from "@academy/courses-api/graphql/queries/subscription-plans"
import { MembershipDetailsPage } from "@academy/user-ui/components/pages/membership-details-page"
import { redirect } from "react-router"
import { buildPageMeta } from "../../lib/seo"
import type { Route } from "./+types/details"

export function meta({ params, loaderData }: Route.MetaArgs) {
  return buildPageMeta({
    lang: params.lang,
    title: loaderData?.name ?? (params.lang === "en" ? "Membership" : "Membresía"),
    description: loaderData?.description ?? undefined,
  })
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await getSubscriptionPlans(request)
  const plan = (result?.subscriptionPlans ?? []).find(
    (candidate) => candidate?.id === params.planId
  )
  if (!plan) throw redirect(`/${params.lang}/memberships`)

  return {
    id: plan.id,
    name: plan.planName,
    description: plan.planDescription ?? null,
    price: plan.price,
    duration: plan.duration,
  }
}

export default function MembershipDetails({
  loaderData,
  params,
}: Route.ComponentProps) {
  return <MembershipDetailsPage plan={loaderData} lang={params.lang} />
}
