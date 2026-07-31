/** Shape every admin auth/form action returns. The admin panel is Spanish-only
 *  and has no CMS behind it, so messages are literal rather than label codes. */
export interface AdminActionData {
  formError?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

export interface AdminLoginInput {
  /** The API accepts either — exactly one is set from the identifier field. */
  username: string | null
  email: string | null
  password: string
}

/** Mirrors the API's policy so the form can fail fast with the same rules. */
export const PASSWORD_POLICY_MESSAGE =
  "Mínimo 8 caracteres, con al menos un número, una mayúscula y un símbolo."

export function passwordPolicyError(password: string): string | null {
  const meetsPolicy =
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  return meetsPolicy ? null : PASSWORD_POLICY_MESSAGE
}
