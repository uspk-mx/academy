import { apiClient } from "@academy/courses-api/api-client"
import { getCookie, getToken } from "@academy/courses-api/utils"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const LOGIN_MUTATION = graphql(`
  mutation Login($input: Login!) {
    login(input: $input) {
      token
      role
    }
  }
`)

export const LOGOUT = graphql(`
  mutation Mutation {
    logout
  }
`)

export const CREATE_ACCOUNT = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input)
  }
`)

export const CONFIRM_ACCOUNT = graphql(`
  mutation ConfirmAccount($token: String!) {
    confirmAccount(token: $token)
  }
`)

export const RESEND_CONFIRMATION = graphql(`
  mutation ResendConfirmation($identifier: String!) {
    resendConfirmation(identifier: $identifier)
  }
`)

export const FORGOT_PASSWORD = graphql(`
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email)
  }
`)

export const CHANGE_PASSWORD = graphql(`
  mutation ChangePassword($token: String!, $password: String!) {
    changePassword(token: $token, password: $password)
  }
`)

export type LoginMutationResult = ResultOf<typeof LOGIN_MUTATION>
export type LoginMutationVariables = VariablesOf<typeof LOGIN_MUTATION>

export type LogoutData = ResultOf<typeof LOGOUT>

export type CreateAccountMutationResult = ResultOf<typeof CREATE_ACCOUNT>
export type CreateAccountMutationVariables = VariablesOf<typeof CREATE_ACCOUNT>

export type ConfirmAccountMutationResult = ResultOf<typeof CONFIRM_ACCOUNT>
export type ConfirmAccountMutatioVariables = VariablesOf<typeof CONFIRM_ACCOUNT>

export type ResendConfirmationMutationResult = ResultOf<
  typeof RESEND_CONFIRMATION
>
export type ResendConfirmationMutatioVariables = VariablesOf<
  typeof RESEND_CONFIRMATION
>

export type ForgotPasswordMutationResult = ResultOf<typeof FORGOT_PASSWORD>
export type ForgotPasswordMutatioVariables = VariablesOf<typeof FORGOT_PASSWORD>

export type ChangePasswordMutationResult = ResultOf<typeof CHANGE_PASSWORD>
export type ChangePasswordMutatioVariables = VariablesOf<typeof CHANGE_PASSWORD>

export async function loginMutation({
  request,
  variables,
}: {
  request: Request
  variables: LoginMutationVariables
}): Promise<{ data: LoginMutationResult | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  const guestCart = await getCookie(request, "guest_cart")

  let setCookies: string[] = []
  const mutation = await apiClient(
    token,
    (cookies) => {
      setCookies = cookies
    },
    guestCart ? { Cookie: `guest_cart=${guestCart}` } : {}
  )
    .mutation(LOGIN_MUTATION, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export async function logoutMutation(
  request: Request
): Promise<{ data: LogoutData | undefined; setCookies: string[] }> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(LOGOUT, {})
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.message)
  return { data: mutation.data, setCookies }
}

export async function createAccountMutation({
  request,
  variables,
}: {
  request: Request
  variables: CreateAccountMutationVariables
}): Promise<{
  data: CreateAccountMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  const guestCart = await getCookie(request, "guest_cart")

  let setCookies: string[] = []
  const mutation = await apiClient(
    token,
    (cookies) => {
      setCookies = cookies
    },
    guestCart ? { Cookie: `guest_cart=${guestCart}` } : {}
  )
    .mutation(CREATE_ACCOUNT, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.graphQLErrors.toString())
  return { data: mutation.data, setCookies }
}

export async function confirmAccountMutation(
  request: Request,
  variables: ConfirmAccountMutatioVariables
): Promise<{
  data: ConfirmAccountMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CONFIRM_ACCOUNT, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.message)
  return { data: mutation.data, setCookies }
}

export async function resendConfirmationMutation(
  request: Request,
  variables: ResendConfirmationMutatioVariables
): Promise<{
  data: ResendConfirmationMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(RESEND_CONFIRMATION, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.message)
  return { data: mutation.data, setCookies }
}

export async function forgotPasswordMutation(
  request: Request,
  variables: ForgotPasswordMutatioVariables
): Promise<{
  data: ForgotPasswordMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(FORGOT_PASSWORD, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.message)
  return { data: mutation.data, setCookies }
}

export async function chngePasswordMutation(
  request: Request,
  variables: ChangePasswordMutatioVariables
): Promise<{
  data: ChangePasswordMutationResult | undefined
  setCookies: string[]
}> {
  const token = await getToken(request)
  let setCookies: string[] = []
  const mutation = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(CHANGE_PASSWORD, variables)
    .toPromise()

  if (mutation.error) throw new Error(mutation.error.message)
  return { data: mutation.data, setCookies }
}
