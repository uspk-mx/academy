import { loadPrivacyPage } from "@academy/cms/loaders/legal"
import { PrivacyPage } from "@academy/user-ui/components/pages/legal/privacy-page"
import { Route } from "./+types/privacy"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const privacyData = await loadPrivacyPage(lang)
  if (!privacyData) {
    throw new Response("Not Found", { status: 404 })
  }
  return { ...privacyData }
}

export default function Privacy({ loaderData }: Route.ComponentProps) {
  return (
    <PrivacyPage
      body={loaderData.content ?? { raw: null }}
      heading={loaderData.heading ?? ""}
      lastUpdatedLabel={loaderData.lastUpdatedLabel ?? ""}
      lastUpdated={loaderData.lastUpdated ?? ""}
    />
  )
}
