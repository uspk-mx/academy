import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

export const UPDATE_USER_PASSWORD = graphql(`
  mutation UpdateUserPassword($input: UpdateUserPasswordInput!) {
    updateUserPassword(input: $input)
  }
`)

export const UPDATE_USER = graphql(`
  mutation AdminUpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      fullName
      email
      role
      isActive
    }
  }
`)

export const DELETE_USER = graphql(`
  mutation AdminDeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`)

export function updateUserPassword(
  request: Request,
  variables: VariablesOf<typeof UPDATE_USER_PASSWORD>
) {
  return runMutation(request, UPDATE_USER_PASSWORD, variables)
}

export function updateUser(
  request: Request,
  variables: VariablesOf<typeof UPDATE_USER>
) {
  return runMutation(request, UPDATE_USER, variables)
}

export function deleteUser(
  request: Request,
  variables: VariablesOf<typeof DELETE_USER>
) {
  return runMutation(request, DELETE_USER, variables)
}
