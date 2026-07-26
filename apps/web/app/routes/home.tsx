import { loadCtaBanner } from "@academy/cms/loaders/cta-banner"
import { loadHomePage } from "@academy/cms/loaders/home"
import { HomePage } from "@academy/user-ui/components/pages/home-page"
import type { Route } from "./+types/home"

export async function loader({ params }: Route.LoaderArgs) {
  const lang = params.lang
  const [home, ctaBanner] = await Promise.all([
    loadHomePage({ lang }),
    loadCtaBanner({ lang }),
  ])

  if (!home) {
    throw new Response("Not Found", { status: 404 })
  }

  return { ...home, ctaBanner }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { hero, features, pricing, logoStrip, testimonial, showTestimonialsSection } = loaderData

  return (
    <HomePage
      hero={hero}
      features={features}
      pricing={pricing}
      logoStrip={logoStrip}
      testimonial={{
        ...testimonial,
        showTestimonialsSection,
      }}
    />
  )
}
