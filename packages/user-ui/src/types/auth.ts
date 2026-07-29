export interface LoginInput {
  /** The API accepts either — exactly one is set from the identifier field. */
  username: string | null
  email: string | null
  password: string
}

export interface LoginActionData {
  formError?: string
  fieldErrors?: Partial<Record<"identifier" | "password", string>>
  /** Login blocked because the account's email isn't confirmed yet. */
  needsConfirmation?: boolean
  /** Echoed back so the "reenviar correo" action knows where to send. */
  identifier?: string
  /** A confirmation email was just re-sent. */
  resent?: boolean
}

export interface CreateUserInput {
  username: string | null
  password: string | null
  fullName: string | null
  email: string | null
}

export interface SignupActionData {
  formError?: string
  fieldErrors?: Partial<
    Record<"fullName" | "username" | "email" | "password" | "terms", string>
  >
  /** Account created — a confirmation email was sent; show "revisa tu correo". */
  success?: boolean
  /** The address the confirmation email went to. */
  email?: string
}

export interface SignupPageProps {
  errors?: SignupActionData
  submitting?: boolean
}

export interface ForgotPasswordActionData {
  fieldErrors?: { email?: string }
  /** A reset link was requested — show the non-enumerating confirmation. */
  success?: boolean
  email?: string
}

export interface ChangePasswordActionData {
  formError?: string
  fieldErrors?: Partial<Record<"password" | "confirmPassword", string>>
  /** Password updated — show success + link to login. */
  success?: boolean
}

export const authRoutes = ["/login", "/signup"]

/* ------------------------- Labels (CMS-provided) -------------------------- */
/* Shapes match the future Hygraph `AuthPage` model 1:1; the cms package's
 * loadAuthLabels() supplies them (defaults today, Hygraph later). */

export interface AuthErrorLabels {
  required: string
  invalidEmail: string
  minPassword: string
  termsRequired: string
  passwordMismatch: string
  invalidCredentials: string
  socialAuth: string
  passwordPolicy: string
  emailTaken: string
  invalidLink: string
  generic: string
}

export interface AuthShellLabels {
  brandEyebrow: string
  brandTitle: string
  brandTitleAccent: string
  brandDescription: string
  footerNote: string
}

export interface LoginLabels {
  loginTitle: string
  loginTitleAccent: string
  loginSubtitle: string
  loginIdentifierLabel: string
  loginIdentifierPlaceholder: string
  loginPasswordLabel: string
  loginForgotLabel: string
  loginRememberLabel: string
  loginSubmitLabel: string
  loginSubmittingLabel: string
  loginDividerLabel: string
  loginNoAccountText: string
  loginNoAccountCta: string
  loginConfirmedBanner: string
  loginNeedsConfirmationText: string
  loginResendCta: string
  loginResentText: string
}

export interface SignupLabels {
  signupTitle: string
  signupTitleAccent: string
  signupSubtitle: string
  signupNameLabel: string
  signupNamePlaceholder: string
  signupUsernameLabel: string
  signupUsernamePlaceholder: string
  signupUsernameHint: string
  signupEmailLabel: string
  signupEmailPlaceholder: string
  signupPasswordLabel: string
  signupPasswordPlaceholder: string
  signupTermsPrefix: string
  signupTermsLabel: string
  signupTermsJoin: string
  signupPrivacyLabel: string
  signupSubmitLabel: string
  signupSubmittingLabel: string
  signupDividerLabel: string
  signupHasAccountText: string
  signupHasAccountCta: string
  signupSuccessTitle: string
  signupSuccessTitleAccent: string
  signupSuccessTextBefore: string
  signupSuccessTextAfter: string
  signupSpamHint: string
  signupGoToLoginCta: string
}

export interface ForgotPasswordLabels {
  forgotTitle: string
  forgotTitleAccent: string
  forgotTitleSuffix: string
  forgotSubtitle: string
  forgotEmailLabel: string
  forgotEmailPlaceholder: string
  forgotSubmitLabel: string
  forgotSubmittingLabel: string
  forgotRememberedText: string
  forgotRememberedCta: string
  forgotSuccessTitle: string
  forgotSuccessTitleAccent: string
  forgotSuccessTextBefore: string
  forgotSuccessTextAfter: string
  forgotSpamHint: string
  forgotBackToLoginCta: string
}

export interface ChangePasswordLabels {
  changeTitle: string
  changeTitleAccent: string
  changeSubtitle: string
  changePasswordLabel: string
  changePasswordPlaceholder: string
  changeConfirmLabel: string
  changeConfirmPlaceholder: string
  changeSubmitLabel: string
  changeSubmittingLabel: string
  changeSuccessTitle: string
  changeSuccessTitleAccent: string
  changeSuccessText: string
  changeSuccessCta: string
  changeInvalidTitle: string
  changeInvalidText: string
  changeInvalidCta: string
}

export interface ConfirmAccountLabels {
  confirmFailedTitle: string
  confirmFailedText: string
  confirmGoToLoginCta: string
}

export interface AuthLabels {
  shell: AuthShellLabels
  login: LoginLabels
  signup: SignupLabels
  forgot: ForgotPasswordLabels
  change: ChangePasswordLabels
  confirm: ConfirmAccountLabels
  errors: AuthErrorLabels
}
