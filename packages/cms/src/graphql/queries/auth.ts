import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const AUTH_PAGE_QUERY = graphql(`
  query GetAuthPages($locale: Locale!) {
    authPages(locales: [$locale, en]) {
      brandEyebrow
      brandTitle
      brandTitleAccent
      brandDescription
      footerNote
      loginTitle
      loginTitleAccent
      loginSubtitle
      loginIdentifierLabel
      loginIdentifierPlaceholder
      loginPasswordLabel
      loginForgotLabel
      loginRememberLabel
      loginSubmitLabel
      loginSubmittingLabel
      loginDividerLabel
      loginNoAccountText
      loginNoAccountCta
      loginConfirmedBanner
      loginNeedsConfirmationText
      loginResendCta
      loginResentText
      signupTitle
      signupTitleAccent
      signupSubtitle
      signupNameLabel
      signupNamePlaceholder
      signupUsernameLabel
      signupUsernamePlaceholder
      signupUsernameHint
      signupEmailLabel
      signupEmailPlaceholder
      signupPasswordLabel
      signupPasswordPlaceholder
      signupTermsPrefix
      signupTermsLabel
      signupTermsJoin
      signupPrivacyLabel
      signupSubmitLabel
      signupSubmittingLabel
      signupHasAccountText
      signupHasAccountCta
      signupSuccessTitle
      signupSuccessTitleAccent
      signupSuccessTextBefore
      signupSuccessTextAfter
      signupSpamHint
      signupGoToLoginCta
      forgotTitle
      forgotTitleAccent
      forgotTitleSuffix
      forgotSubtitle
      forgotEmailLabel
      forgotEmailPlaceholder
      forgotSubmitLabel
      forgotSubmittingLabel
      forgotRememberedText
      forgotRememberedCta
      forgotSuccessTitle
      forgotSuccessTitleAccent
      forgotSuccessTextBefore
      forgotSuccessTextAfter
      forgotSpamHint
      forgotBackToLoginCta
      changeTitle
      changeTitleAccent
      changeSubtitle
      changePasswordLabel
      changePasswordPlaceholder
      changeConfirmLabel
      changeConfirmPlaceholder
      changeSubmitLabel
      changeSubmittingLabel
      changeSuccessTitle
      changeSuccessTitleAccent
      changeSuccessText
      changeSuccessCta
      changeInvalidTitle
      changeInvalidText
      changeInvalidCta
      confirmFailedTitle
      confirmFailedText
      confirmGoToLoginCta
      errorRequired
      errorInvalidEmail
      errorMinPassword
      errorTermsRequired
      errorPasswordMismatch
      errorInvalidCredentials
      errorInvalidLink
      errorGeneric
    }
  }
`)

export type AuthPageData = ResultOf<typeof AUTH_PAGE_QUERY>
export type AuthPageVariables = VariablesOf<typeof AUTH_PAGE_QUERY>

export async function getAuthPage({
  variables,
}: {
  variables: AuthPageVariables
}): Promise<AuthPageData> {
  return cmsAPIClient(AUTH_PAGE_QUERY, variables)
}
