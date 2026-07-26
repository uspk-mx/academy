import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const CATEGORIES_QUERY = graphql(`
  query GetCategories {
    getCategories {
      id
      name
      slug
      description
      coursesCount
    }
  }
`)

export type CategoriesData = ResultOf<typeof CATEGORIES_QUERY>

export async function getCategories(request: Request): Promise<CategoriesData> {
  return coursesApiClient(request, CATEGORIES_QUERY, {})
}
