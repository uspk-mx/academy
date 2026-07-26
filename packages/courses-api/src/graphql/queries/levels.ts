import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const LEVELS_QUERY = graphql(`
  query GetLevels {
    getLevels {
      id
      name
      slug
      description
      coursesCount
    }
  }
`)

export type LevelsData = ResultOf<typeof LEVELS_QUERY>

export async function getLevels(request: Request): Promise<LevelsData> {
  return coursesApiClient(request, LEVELS_QUERY, {})
}
