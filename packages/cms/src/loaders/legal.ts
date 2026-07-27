import { getLocale } from "@academy/user-ui/lib/lang"
import {
  getPrivacyNotice,
  getTermsAndConditions,
  PrivacyNoticeData,
  TermsAndConditionsData,
} from "../graphql/queries/legal"

export async function loadPrivacyPage(
  lang: string
): Promise<PrivacyNoticeData["privacyNotices"][number]> {
  const locale = getLocale(lang)
  const { privacyNotices } = await getPrivacyNotice({
    variables: { locale: locale },
  })

  const privacyNotice = privacyNotices[0]

  return privacyNotice
}

export async function loadTermsPage(
  lang: string
): Promise<TermsAndConditionsData["termsAndConditions"][number]> {
  const locale = getLocale(lang)
  const { termsAndConditions } = await getTermsAndConditions({
    variables: { locale: locale },
  })

  const terms = termsAndConditions[0]

  return terms
}
