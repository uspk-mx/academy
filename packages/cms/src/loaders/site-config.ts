import { getLocale } from "@academy/user-ui/lib/lang"
import { getSiteConfigs } from "../graphql/queries/site-configs"
import {
  footerColumnsJsonSchema,
  jsonItemId,
  navLinksJsonSchema,
  parseJsonField,
} from "./json-fields"

export async function loadSiteConfig({ lang }: { lang?: string }) {
  const locale = getLocale(lang)
  const { siteConfigs } = await getSiteConfigs({
    variables: { locales: [locale] },
  })
  const siteConfig = siteConfigs[0]

  if (!siteConfig) {
    throw new Error("Hygraph SiteConfig entry not found")
  }

  const rawNavLinks = parseJsonField(
    navLinksJsonSchema,
    siteConfig.navLinksJson,
    "SiteConfig.navLinksJson"
  )
  const rawFooterColumns = parseJsonField(
    footerColumnsJsonSchema,
    siteConfig.footerColumnsJson,
    "SiteConfig.footerColumnsJson"
  )

  const navLinks = rawNavLinks.map((item, index) => ({
    id: jsonItemId("nav", item, index),
    label: item.label,
    href: item.href,
    external: item.external ?? false,
    order: item.order ?? index + 1,
  }))

  const footerColumns = rawFooterColumns.map((item, index) => ({
    id: jsonItemId("footer", item, index),
    title: item.title,
    linkLabels: item.links.map(({ label }) => label),
    linkHrefs: item.links.map(({ href }) => href),
    order: item.order ?? index + 1,
  }))

  return { siteConfig, navLinks, footerColumns }
}
