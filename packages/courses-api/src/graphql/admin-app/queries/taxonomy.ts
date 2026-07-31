import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const ADMIN_LEVELS_QUERY = graphql(`
  query AdminLevels {
    getLevels {
      id
      name
      slug
      description
      coursesCount
      createdAt
      updatedAt
    }
  }
`)

export const ADMIN_CATEGORIES_QUERY = graphql(`
  query AdminCategories {
    getCategories {
      id
      name
      slug
      description
      coursesCount
      createdAt
      updatedAt
    }
  }
`)

export type AdminLevelsData = ResultOf<typeof ADMIN_LEVELS_QUERY>
export type AdminCategoriesData = ResultOf<typeof ADMIN_CATEGORIES_QUERY>

export type AdminLevel = AdminLevelsData["getLevels"][number]
export type AdminCategory = AdminCategoriesData["getCategories"][number]

export function getAdminLevels(request: Request) {
  return runQuery(request, ADMIN_LEVELS_QUERY, {})
}

export function getAdminCategories(request: Request) {
  return runQuery(request, ADMIN_CATEGORIES_QUERY, {})
}
