import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

export const CREATE_COMPANY = graphql(`
  mutation CreateCompany($input: CreateCompanyInput) {
    createCompany(input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_COMPANY = graphql(`
  mutation UpdateCompany($companyId: ID!, $input: UpdateCompanyInput) {
    updateCompany(companyId: $companyId, input: $input) {
      id
      name
      isActive
    }
  }
`)

export const DELETE_COMPANY = graphql(`
  mutation DeleteCompany($companyId: ID!) {
    deleteCompany(companyId: $companyId)
  }
`)

export const INVITE_ADMINS = graphql(`
  mutation InviteAdmins($input: InviteAdminsInput!) {
    inviteAdmins(input: $input) {
      companyId
      invited
      skipped
      errors
    }
  }
`)

export const RESEND_ADMIN_INVITE = graphql(`
  mutation ResendAdminInvite($inviteId: ID!) {
    resendAdminInvite(inviteId: $inviteId) {
      __typename
      ... on AdminInvite {
        id
        email
        status
        expiresAt
      }
      ... on InviteExpiredAndRenewed {
        oldInviteId
        newInvite {
          id
          email
          expiresAt
        }
      }
      ... on InviteNotFoundError {
        message
      }
      ... on InviteNotActiveError {
        message
      }
    }
  }
`)

export function createCompany(
  request: Request,
  variables: VariablesOf<typeof CREATE_COMPANY>
) {
  return runMutation(request, CREATE_COMPANY, variables)
}

export function updateCompany(
  request: Request,
  variables: VariablesOf<typeof UPDATE_COMPANY>
) {
  return runMutation(request, UPDATE_COMPANY, variables)
}

export function deleteCompany(
  request: Request,
  variables: VariablesOf<typeof DELETE_COMPANY>
) {
  return runMutation(request, DELETE_COMPANY, variables)
}

export function inviteAdmins(
  request: Request,
  variables: VariablesOf<typeof INVITE_ADMINS>
) {
  return runMutation(request, INVITE_ADMINS, variables)
}

export function resendAdminInvite(
  request: Request,
  variables: VariablesOf<typeof RESEND_ADMIN_INVITE>
) {
  return runMutation(request, RESEND_ADMIN_INVITE, variables)
}
