import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const TERMS_AND_CONDITIONS_QUERY = graphql(`
  query TermsAndConditions($locale: Locale!) {
    termsAndConditions(locales: [$locale]) {
      heading
      id
      lastUpdated
      lastUpdatedLabel
      updatedAt
      content {
        __typename
        raw
      }
    }
  }
`)

export type TermsAndConditionsData = ResultOf<typeof TERMS_AND_CONDITIONS_QUERY>
export type TermsAndConditionsVariables = VariablesOf<
  typeof TERMS_AND_CONDITIONS_QUERY
>

export async function getTermsAndConditions({
  variables,
}: {
  variables: TermsAndConditionsVariables
}): Promise<TermsAndConditionsData> {
  return cmsAPIClient(TERMS_AND_CONDITIONS_QUERY, variables)
}

const PRIVACY_NOTICE_CONDITIONS_QUERY = graphql(`
  query PrivacyNotices($locale: Locale!) {
    privacyNotices(locales: [$locale]) {
      heading
      id
      lastUpdated
      lastUpdatedLabel
      updatedAt
      content {
        __typename
        raw
      }
    }
  }
`)

export type PrivacyNoticeData = ResultOf<typeof PRIVACY_NOTICE_CONDITIONS_QUERY>
export type PrivacyNoticeVariables = VariablesOf<
  typeof PRIVACY_NOTICE_CONDITIONS_QUERY
>

export async function getPrivacyNotice({
  variables,
}: {
  variables: PrivacyNoticeVariables
}): Promise<PrivacyNoticeData> {
  return cmsAPIClient(PRIVACY_NOTICE_CONDITIONS_QUERY, variables)
}
