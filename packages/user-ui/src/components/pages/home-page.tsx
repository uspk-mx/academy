import type {
  FeaturesSectionContent,
  HomeHeroContent,
  LogoStripContent,
  PricingSectionContent,
  Testimonial,
} from "@academy/user-ui/types/cms"
import { LogoStrip, TestimonialBanner } from "../marketing/banners"
import { FeaturesSection } from "../marketing/feature-cards"
import { HomeHero } from "../marketing/home-hero"
import { PricingSection } from "../marketing/pricing-cards"

export interface HomePageProps {
  hero: HomeHeroContent
  features: FeaturesSectionContent
  pricing: PricingSectionContent
  logoStrip: LogoStripContent
  testimonial: Testimonial
}

export function HomePage({
  hero,
  features,
  pricing,
  logoStrip,
  testimonial,
}: HomePageProps) {
  return (
    <main className="bg-surface-page">
      <HomeHero content={hero} />
      <FeaturesSection content={features} />
      <PricingSection content={pricing} />
      <LogoStrip content={logoStrip} className="pt-section-y" />
      <TestimonialBanner testimonial={testimonial} className="py-section-y" />
    </main>
  )
}
