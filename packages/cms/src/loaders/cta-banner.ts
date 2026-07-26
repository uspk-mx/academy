import { getLocale } from "@academy/user-ui/lib/lang"
import { getCTABanner } from "../graphql/queries/cta-banner"
import { CmsImage, CtaBannerContent } from "@academy/user-ui/types/cms"

export async function loadCtaBanner({
  lang,
}: {
  lang: string
}): Promise<CtaBannerContent> {
  const locale = getLocale(lang)
  const { ctaBanners } = await getCTABanner({
    variables: { locales: [locale] },
  })

  const banner = ctaBanners[0]
  return {
    headlineLines: banner.headlineLines as string[],
    description: banner.description,
    primaryCta: { label: banner.primaryCtaLabel, href: banner.primaryCtaHref },
    secondaryCta: {
      label: banner.secondaryCtaLabel ?? "",
      href: banner.secondaryCtaHref ?? "",
    },
    portraits: banner.portraits as unknown as CmsImage[],
  }
}
