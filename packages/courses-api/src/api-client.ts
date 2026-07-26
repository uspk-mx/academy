import { createBaseUrqlClient } from "@academy/graphql-utils"
import { getToken } from "./utils"

/** Reads a server env var without requiring node types in this package. */
function serverEnv(name: string): string | undefined {
  return (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.[name]
}

// The Go GraphQL API. Public URL, so `VITE_API_URL` is fine to inline into the
// client bundle; `API_URL` allows a server-only override. Falls back to the
// local dev API.
const API_ENDPOINT =
  serverEnv("API_URL") ||
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_URL ||
  "http://localhost:4000/query"

export const apiClient = (
  token: string | undefined,
  onSetCookie?: (cookies: string[]) => void,
  headers?: HeadersInit
) =>
  createBaseUrqlClient({
    url: API_ENDPOINT,
    preferGetMethod: false,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `session_token=${token}` } : {}),
      ...headers,
    },
    onSetCookie,
  })

export async function coursesApiClient<T, V extends Record<string, unknown>>(
  request: Request,
  query: T,
  variables?: V
) {
  const token = await getToken(request)
  const result = await apiClient(token)
    .query(query as any, variables ?? {})
    .toPromise()
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function coursesMutationClient<T, V extends Record<string, unknown>>(
  request: Request,
  mutation: T,
  variables?: V
) {
  const token = await getToken(request)
  const result = await apiClient(token)
    .mutation(mutation as any, variables ?? {})
    .toPromise()
  if (result.error) throw new Error(result.error.message)
  return result.data
}

