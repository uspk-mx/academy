import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const ADMIN_USERS_QUERY = graphql(`
  query AdminUsers {
    getUsers {
      id
      fullName
      userName
      email
      role
      isActive
      isVerified
      profilePicture
      occupation
      createdAt
    }
  }
`)

/** Staff accounts (admins + instructors) — the instructors screen. */
export const ADMIN_INTERNAL_USERS_QUERY = graphql(`
  query AdminInternalUsers {
    internalUsers {
      id
      fullName
      userName
      email
      role
      isActive
      profilePicture
      createdAt
    }
  }
`)

export const ADMIN_INSTRUCTORS_QUERY = graphql(`
  query AdminInstructors {
    instructors {
      id
      assignedAt
      role
      isActive
      user {
        id
        fullName
        email
        profilePicture
      }
      courses {
        id
        title
      }
    }
  }
`)

export type AdminUsersData = ResultOf<typeof ADMIN_USERS_QUERY>
export type AdminUserRow = NonNullable<AdminUsersData["getUsers"]>[number]

export type AdminInternalUsersData = ResultOf<
  typeof ADMIN_INTERNAL_USERS_QUERY
>
export type AdminInstructorsData = ResultOf<typeof ADMIN_INSTRUCTORS_QUERY>
export type AdminInstructorRow = AdminInstructorsData["instructors"][number]

export function getAdminUsers(request: Request) {
  return runQuery(request, ADMIN_USERS_QUERY, {})
}

export function getAdminInternalUsers(request: Request) {
  return runQuery(request, ADMIN_INTERNAL_USERS_QUERY, {})
}

export function getAdminInstructors(request: Request) {
  return runQuery(request, ADMIN_INSTRUCTORS_QUERY, {})
}
