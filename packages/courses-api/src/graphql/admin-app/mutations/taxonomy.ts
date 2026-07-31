import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

export const CREATE_LEVEL = graphql(`
  mutation CreateLevel($input: CreateLevelOrCategoryInput!) {
    createLevel(input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_LEVEL = graphql(`
  mutation UpdateLevel($id: ID!, $input: UpdateLevelOrCategoryInput!) {
    updateLevel(id: $id, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_LEVEL = graphql(`
  mutation DeleteLevel($id: ID!) {
    deleteLevel(id: $id)
  }
`)

export const CREATE_CATEGORY = graphql(`
  mutation CreateCategory($input: CreateLevelOrCategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_CATEGORY = graphql(`
  mutation UpdateCategory($id: ID!, $input: UpdateLevelOrCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_CATEGORY = graphql(`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`)

export function createLevel(
  request: Request,
  variables: VariablesOf<typeof CREATE_LEVEL>
) {
  return runMutation(request, CREATE_LEVEL, variables)
}

export function updateLevel(
  request: Request,
  variables: VariablesOf<typeof UPDATE_LEVEL>
) {
  return runMutation(request, UPDATE_LEVEL, variables)
}

export function deleteLevel(
  request: Request,
  variables: VariablesOf<typeof DELETE_LEVEL>
) {
  return runMutation(request, DELETE_LEVEL, variables)
}

export function createCategory(
  request: Request,
  variables: VariablesOf<typeof CREATE_CATEGORY>
) {
  return runMutation(request, CREATE_CATEGORY, variables)
}

export function updateCategory(
  request: Request,
  variables: VariablesOf<typeof UPDATE_CATEGORY>
) {
  return runMutation(request, UPDATE_CATEGORY, variables)
}

export function deleteCategory(
  request: Request,
  variables: VariablesOf<typeof DELETE_CATEGORY>
) {
  return runMutation(request, DELETE_CATEGORY, variables)
}
