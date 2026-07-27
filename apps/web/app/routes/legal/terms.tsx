import { loadTermsPage } from "@academy/cms/loaders/legal"
import { TermsPage } from "@academy/user-ui/components/pages/legal/terms-page"
import type { Route } from "./+types/terms"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const privacyData = await loadTermsPage(lang)
  if (!privacyData) {
    throw new Response("Not Found", { status: 404 })
  }
  return { ...privacyData }
}

export default function Terms({ loaderData }: Route.ComponentProps) {
  return (
    <TermsPage
      body={loaderData.content ?? { raw: null }}
      heading={loaderData.heading ?? ""}
      lastUpdatedLabel={loaderData.lastUpdatedLabel ?? ""}
      lastUpdated={loaderData.lastUpdated ?? ""}
    />
  )
}
