import { createBaseUrqlClient } from "@academy/graphql-utils"
import { initGraphQLTada } from "gql.tada"
import type { introspection } from "./graphql/graphql-env.d.ts"

/** Reads a server env var without requiring node types in this package. */
function serverEnv(name: string): string | undefined {
  return (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.[name]
}

// CMS is only ever read from loaders (server-side), so both the endpoint and the
// token come from server env — the token must NEVER be inlined into the client
// bundle. Missing values fail the fetch; loaders catch it and fall back to
// their default content.
const HYGRAPH_CONTENT_ENDPOINT = serverEnv("HYGRAPH_CONTENT_ENDPOINT") ?? ""
const HYGRAPH_AUTH_TOKEN = serverEnv("HYGRAPH_AUTH_TOKEN") ?? ""

export const hygraphClient = createBaseUrqlClient({
  url: HYGRAPH_CONTENT_ENDPOINT,
  preferGetMethod: false,
  headers: {
    Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
  },
})

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type RichTextAST = {
  children?: JsonValue[]
  [key: string]: JsonValue | undefined
}

export const graphql = initGraphQLTada<{
  introspection: introspection
  scalars: {
    Date: string
    DateTime: string
    Hex: string
    Json: JsonValue
    Long: number
    RGBAHue: number
    RGBATransparency: number
    RichTextAST: RichTextAST
  }
}>()

export async function cmsAPIClient<T, V extends Record<string, unknown>>(
  query: T,
  variables?: V
) {
  const result = await hygraphClient
    .query(query as any, variables ?? {})
    .toPromise()
  if (result.error) throw new Error(result.error.message)
  return result.data
}
