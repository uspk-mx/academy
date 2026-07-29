/**
 * Auth screens labels (login / signup / forgot & change password / confirm
 * account + shared AuthShell copy and validation messages).
 *
 * Fetched from the Hygraph `AuthPage` model; unfilled fields fall back to the
 * defaults below. `errors.*` maps to the CMS `error*` fields.
 */
import { getLocale } from "@academy/user-ui/lib/lang"
import type { AuthLabels } from "@academy/user-ui/types/auth"
import { getAuthPage } from "../graphql/queries/auth"
import { fillLabels } from "./label-utils"

export type { AuthLabels }

export const defaultAuthLabels: AuthLabels = {
  shell: {
    brandEyebrow: "Para profesionales",
    brandTitle: "10 minutos al día.",
    brandTitleAccent: "Y ya.",
    brandDescription:
      "Tu primera lección dura lo que un café. La siguiente, también.",
    footerNote: "Üspk academy® · Hecho en Guadalajara",
  },
  login: {
    loginTitle: "Bienvenido",
    loginTitleAccent: "de vuelta",
    loginSubtitle: "Continúa donde lo dejaste.",
    loginIdentifierLabel: "Usuario o correo",
    loginIdentifierPlaceholder: "tu@correo.com",
    loginPasswordLabel: "Contraseña",
    loginForgotLabel: "¿Olvidaste tu contraseña?",
    loginRememberLabel: "Mantenerme conectado",
    loginSubmitLabel: "Entrar",
    loginSubmittingLabel: "Entrando…",
    loginDividerLabel: "o continúa con",
    loginNoAccountText: "¿Aún no tienes cuenta?",
    loginNoAccountCta: "Crea una",
    loginConfirmedBanner: "¡Cuenta confirmada! Ya puedes iniciar sesión.",
    loginNeedsConfirmationText:
      "Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
    loginResendCta: "Reenviar correo de confirmación",
    loginResentText: "Te reenviamos el correo de confirmación.",
  },
  signup: {
    signupTitle: "Empecemos",
    signupTitleAccent: "hoy",
    signupSubtitle: "Guarda tu progreso y aprende a tu ritmo.",
    signupNameLabel: "Nombre completo",
    signupNamePlaceholder: "Alvaro Castillo",
    signupUsernameLabel: "Nombre de usuario",
    signupUsernamePlaceholder: "alvaro.castillo",
    signupUsernameHint: "Con él también podrás iniciar sesión.",
    signupEmailLabel: "Correo electrónico",
    signupEmailPlaceholder: "tu@correo.com",
    signupPasswordLabel: "Crea una contraseña",
    signupPasswordPlaceholder: "Mín. 8: número, mayúscula y símbolo",
    signupTermsPrefix: "Acepto los",
    signupTermsLabel: "Términos",
    signupTermsJoin: "y la",
    signupPrivacyLabel: "Política de Privacidad",
    signupSubmitLabel: "Crear mi cuenta",
    signupSubmittingLabel: "Creando cuenta…",
    signupDividerLabel: "o regístrate con",
    signupHasAccountText: "¿Ya tienes cuenta?",
    signupHasAccountCta: "Iniciar sesión",
    signupSuccessTitle: "Revisa tu",
    signupSuccessTitleAccent: "correo",
    signupSuccessTextBefore: "Te enviamos un enlace de confirmación a",
    signupSuccessTextAfter:
      "Ábrelo para activar tu cuenta y poder iniciar sesión.",
    signupSpamHint: "¿No lo encuentras? Revisa tu carpeta de spam.",
    signupGoToLoginCta: "Ir a iniciar sesión",
  },
  forgot: {
    forgotTitle: "¿Olvidaste tu",
    forgotTitleAccent: "contraseña",
    forgotTitleSuffix: "?",
    forgotSubtitle:
      "Escribe tu correo y te enviaremos un enlace para crear una nueva.",
    forgotEmailLabel: "Correo electrónico",
    forgotEmailPlaceholder: "tu@correo.com",
    forgotSubmitLabel: "Enviar enlace",
    forgotSubmittingLabel: "Enviando…",
    forgotRememberedText: "¿Ya la recordaste?",
    forgotRememberedCta: "Iniciar sesión",
    forgotSuccessTitle: "Revisa tu",
    forgotSuccessTitleAccent: "correo",
    forgotSuccessTextBefore: "Si existe una cuenta con",
    forgotSuccessTextAfter:
      "te enviamos un enlace para restablecer tu contraseña.",
    forgotSpamHint: "¿No lo encuentras? Revisa tu carpeta de spam.",
    forgotBackToLoginCta: "Volver a iniciar sesión",
  },
  change: {
    changeTitle: "Crea una nueva",
    changeTitleAccent: "contraseña",
    changeSubtitle: "Elige una contraseña que no hayas usado antes.",
    changePasswordLabel: "Nueva contraseña",
    changePasswordPlaceholder: "Mínimo 8 caracteres",
    changeConfirmLabel: "Confirma tu contraseña",
    changeConfirmPlaceholder: "Repite tu contraseña",
    changeSubmitLabel: "Cambiar contraseña",
    changeSubmittingLabel: "Guardando…",
    changeSuccessTitle: "Contraseña",
    changeSuccessTitleAccent: "actualizada",
    changeSuccessText: "Ya puedes iniciar sesión con tu nueva contraseña.",
    changeSuccessCta: "Iniciar sesión",
    changeInvalidTitle: "Enlace no válido.",
    changeInvalidText:
      "El enlace para restablecer tu contraseña no es válido o ya expiró. Solicita uno nuevo.",
    changeInvalidCta: "Solicitar un nuevo enlace",
  },
  confirm: {
    confirmFailedTitle: "No pudimos confirmar tu cuenta.",
    confirmFailedText:
      "El enlace no es válido o ya expiró. Intenta iniciar sesión: si tu cuenta sigue sin confirmar, podrás reenviarte el correo desde ahí.",
    confirmGoToLoginCta: "Ir a iniciar sesión",
  },
  errors: {
    required: "Este campo es obligatorio.",
    invalidEmail: "Escribe un correo válido.",
    minPassword: "Mínimo 8 caracteres.",
    termsRequired: "Acepta los términos para crear tu cuenta.",
    passwordMismatch: "Las contraseñas no coinciden.",
    invalidCredentials: "Usuario o contraseña incorrectos.",
    socialAuth: "Esta cuenta usa Google. Inicia sesión con Google.",
    passwordPolicy:
      "La contraseña debe tener al menos 8 caracteres, un número, una mayúscula y un símbolo.",
    emailTaken:
      "Ese correo o usuario ya está registrado. Intenta iniciar sesión.",
    invalidLink: "El enlace no es válido o ya expiró. Solicita uno nuevo.",
    generic:
      "Algo salió mal. Inténtalo de nuevo más tarde o contacta a soporte.",
  },
}

export async function loadAuthLabels(lang: string): Promise<AuthLabels> {
  const locale = getLocale(lang)
  const d = defaultAuthLabels
  try {
    const { authPages } = await getAuthPage({ variables: { locale } })
    const cms = (authPages[0] ?? null) as Record<string, unknown> | null
    return {
      shell: fillLabels(d.shell, cms),
      login: fillLabels(d.login, cms),
      signup: fillLabels(d.signup, cms),
      forgot: fillLabels(d.forgot, cms),
      change: fillLabels(d.change, cms),
      confirm: fillLabels(d.confirm, cms),
      errors: fillLabels(
        d.errors,
        cms,
        (k) => "error" + k[0].toUpperCase() + k.slice(1)
      ),
    }
  } catch {
    // CMS down → the auth screens still render with default copy.
    return d
  }
}
