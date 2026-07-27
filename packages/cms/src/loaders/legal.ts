import { getLocale } from "@academy/user-ui/lib/lang"
import { getLegalPage, LegalPageData } from "../graphql/queries/legal"

export type LegalPage = NonNullable<LegalPageData["termsAndCondition"]>

async function loadLegalPage(
  lang: string,
  slug: "privacy-notice" | "terms-and-conditions"
): Promise<LegalPage | null> {
  const locale = getLocale(lang)
  const { termsAndCondition } = await getLegalPage({
    variables: { locale, slug },
  })

  return termsAndCondition ?? null
}

export function loadPrivacyPage(lang: string): Promise<LegalPage | null> {
  return loadLegalPage(lang, "privacy-notice")
}

export function loadTermsPage(lang: string): Promise<LegalPage | null> {
  return loadLegalPage(lang, "terms-and-conditions")
}
