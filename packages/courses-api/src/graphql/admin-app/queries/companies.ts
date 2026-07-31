import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const ADMIN_COMPANIES_QUERY = graphql(`
  query AdminCompanies {
    companies {
      id
      name
      email
      address
      taxId
      taxName
      isActive
      logo
      icon
      stripeId
      createdAt
      updatedAt
      subscriptions {
        id
        status
        quantity
        plan {
          id
          planName
          price
        }
      }
    }
  }
`)

export const ADMIN_COMPANY_QUERY = graphql(`
  query AdminCompany($id: ID!) {
    company(id: $id) {
      id
      name
      email
      address
      taxId
      taxName
      isActive
      logo
      icon
      stripeId
      createdAt
      updatedAt
      subscriptions {
        id
        status
        quantity
        stripeSubscriptionId
        plan {
          id
          planName
          price
          duration
        }
        subscriptionCodes {
          id
          code
          isRedeemed
        }
      }
    }
    companyAdmins(companyId: $id) {
      id
      fullName
      email
      isActive
    }
    companyUsers(companyId: $id) {
      id
      fullName
      email
      isActive
    }
  }
`)

export type AdminCompaniesData = ResultOf<typeof ADMIN_COMPANIES_QUERY>
export type AdminCompany = AdminCompaniesData["companies"][number]

export type AdminCompanyDetailData = ResultOf<typeof ADMIN_COMPANY_QUERY>

export function getAdminCompanies(request: Request) {
  return runQuery(request, ADMIN_COMPANIES_QUERY, {})
}

export function getAdminCompany(request: Request, id: string) {
  return runQuery(request, ADMIN_COMPANY_QUERY, { id })
}
