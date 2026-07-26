import { loadAboutPage } from "@academy/cms/loaders/about"
import { AboutPage } from "@academy/user-ui/components/pages/about-page"
import type { Route } from "./+types/about"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const about = await loadAboutPage(lang)
  if (!about) {
    throw new Response("Not Found", { status: 404 })
  }
  return { ...about }
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <AboutPage {...loaderData} />
}
