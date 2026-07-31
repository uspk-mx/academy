import {
  createBaseUrqlClient,
  normalizeGraphQLError,
  type NormalizedGraphQLError,
} from "@academy/graphql-utils"
import type { TadaDocumentNode } from "gql.tada"
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

/**
 * Typed query runner for gql.tada documents. Unlike `coursesApiClient` it keeps
 * the document's result type, so callers need no casts.
 */
export async function runQuery<Result, Variables extends Record<string, any>>(
  request: Request,
  document: TadaDocumentNode<Result, Variables>,
  variables: Variables
): Promise<Result> {
  const token = await getToken(request)
  const result = await apiClient(token).query(document, variables).toPromise()
  if (result.error) throw new Error(result.error.message)
  return result.data as Result
}

export interface MutationOutcome<Result> {
  data: Result | undefined
  /** `null` on success. Non-throwing so form actions can return the message to
   *  the page instead of tripping the route error boundary. */
  error: NormalizedGraphQLError | null
  /** Cookies the API rotated (session refresh) — forward them on the response. */
  setCookies: string[]
}

/**
 * Typed mutation runner. Every admin write goes through this: it threads the
 * session cookie in, collects any refreshed cookie on the way out, and reports
 * failures as data rather than exceptions.
 */
export async function runMutation<
  Result,
  Variables extends Record<string, any>,
>(
  request: Request,
  document: TadaDocumentNode<Result, Variables>,
  variables: Variables
): Promise<MutationOutcome<Result>> {
  const token = await getToken(request)
  let setCookies: string[] = []

  const result = await apiClient(token, (cookies) => {
    setCookies = cookies
  })
    .mutation(document, variables)
    .toPromise()

  return {
    data: result.data as Result | undefined,
    error: result.error ? normalizeGraphQLError(result.error) : null,
    setCookies,
  }
}

