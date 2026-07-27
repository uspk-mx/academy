import { getLocale } from "@academy/user-ui/lib/lang"
import {
  CmsImage,
  FeatureItem,
  FeaturesSectionContent,
  HomeHeroContent,
  LogoStripContent,
  PricingPlanContent,
  PricingSectionContent,
  Testimonial,
  TitleSegment,
  UnitTeaserContent,
} from "@academy/user-ui/types/cms"
import { getHomeData } from "../graphql/queries"
import {
  featureCardsJsonSchema,
  jsonItemId,
  parseJsonField,
  pricingPlansJsonSchema,
} from "./json-fields"

function mapIcon(icon: string): FeatureItem["icon"] {
  return (icon === "bar_chart" ? "bar-chart" : icon) as FeatureItem["icon"]
}

interface HomeData {
  hero: HomeHeroContent
  features: FeaturesSectionContent
  pricing: PricingSectionContent
  logoStrip: LogoStripContent
  testimonial: Testimonial
  showTestimonialsSection?: boolean
}

export async function loadHomePage({
  lang,
}: {
  lang?: string
}): Promise<HomeData> {
  const locale = getLocale(lang)
  const { homePages } = await getHomeData({
    variables: { locales: [locale] },
  })

  const h = homePages[0]
  const featureCards = parseJsonField(
    featureCardsJsonSchema,
    h.featureCardsJson,
    "HomePage.featureCardsJson"
  )
  const pricingPlans = parseJsonField(
    pricingPlansJsonSchema,
    h.pricingPlansJson,
    "HomePage.pricingPlansJson"
  )

  return {
    // ── Hero ───────────────────────────────────────────────────────────────
    hero: {
      title: h.heroTitle as unknown as TitleSegment[],
      subtitle: h.heroSubtitle as string,
      primaryCta: {
        label: h.heroPrimaryCtaLabel ?? "",
        href: h.heroPrimaryCtaHref ?? "",
      },
      secondaryCta: {
        label: h.heroSecondaryCtaLabel ?? "",
        href: h.heroSecondaryCtaHref ?? "",
      },
      disclaimer: h.heroDisclaimer ?? "",
      image: {
        url: h.heroImage?.url ?? "",
        alt: h.heroImage?.fileName ?? "",
        height: h.heroImage?.height ?? 0,
        width: h.heroImage?.width ?? 0,
      },
      unitTeaser: h.unitTeaserTitle
        ? ({
            unitLabel: h.unitTeaserUnitLabel,
            title: h.unitTeaserTitle,
            description: h.unitTeaserDescription,
            streakLabel: h.unitTeaserStreakLabel,
            characterImage: h.unitTeaserCharacterImage,
          } as unknown as UnitTeaserContent)
        : undefined,
    },

    // ── Features ───────────────────────────────────────────────────────────
    features: {
      eyebrow: h.featureEyebrow ?? "",
      title: h.featureTitle as unknown as TitleSegment[],
      items: featureCards.map((c, index): FeatureItem => ({
        id: jsonItemId("feature", c, index),
        eyebrow: c.eyebrow,
        title: c.title,
        description: c.description,
        icon: mapIcon(c.icon),
        tone: c.tone,
      })),
    },

    // ── Pricing ────────────────────────────────────────────────────────────
    pricing: {
      showPricingSection: h.showPricingSection ?? false,
      eyebrow: h.pricingEyebrow ?? "",
      title: h.pricingTitle as unknown as TitleSegment[],
      subtitle: h.pricingSubtitle ?? "",
      plans: pricingPlans.map((p, index): PricingPlanContent => ({
        id: jsonItemId("pricing", p, index),
        name: p.name,
        price: p.price,
        priceSuffix: p.priceSuffix,
        features: p.features,
        cta: { label: p.ctaLabel, href: p.ctaHref },
        ctaTone: p.ctaTone ?? undefined,
        highlighted: p.highlighted ?? undefined,
        highlightLabel: p.highlightLabel ?? undefined,
      })),
    },

    // ── Logo strip ─────────────────────────────────────────────────────────
    logoStrip: {
      showCompaniesSection: h.showCompaniesSection ?? false,
      title: h.logosTitle ?? "",
      logos: h.companyLogos.map((l: any) => ({
        url: l.logo?.url ?? "",
        alt: l.alt,
      })),
    },

    showTestimonialsSection: h.showTestimonialsSection ?? false,
    // ── Testimonial (first) ────────────────────────────────────────────────
    testimonial: h.testimonials[0]
      ? {
          quote: h.testimonials[0].quote,
          quoteEmphasis: h.testimonials[0].quoteEmphasis,
          authorName: h.testimonials[0].authorName,
          authorRole: h.testimonials[0].authorRole,
          avatar: h.testimonials[0].avatar,
        }
      : (undefined as any),
  }
}
