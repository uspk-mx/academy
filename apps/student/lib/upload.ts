import { getToken } from "@academy/courses-api/utils"

/**
 * Server-side file upload to the courses API (`POST /api/files/upload`, see
 * server.go). Runs from the route action so the API host and the session cookie
 * never reach the browser, and no CORS grant is needed for the app subdomain.
 *
 * The API base mirrors `courses-api/api-client`'s hardcoded endpoint; both
 * should move to one env var (COURSES_API_URL) when env plumbing lands.
 */
const API_BASE = (
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.COURSES_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "")

/** Returns the uploaded file URL, or null when the upload fails. */
export async function uploadFile(
  request: Request,
  file: File,
  folder = "attachments"
): Promise<string | null> {
  const token = await getToken(request)

  const body = new FormData()
  body.append("file", file)
  body.append("folder", folder)

  try {
    const response = await fetch(`${API_BASE}/api/files/upload`, {
      method: "POST",
      body,
      headers: token ? { Cookie: `session_token=${token}` } : undefined,
    })

    if (!response.ok) {
      console.error("[upload] failed:", response.status, await response.text())
      return null
    }

    const result = (await response.json()) as { url?: string }
    return result.url ?? null
  } catch (error) {
    console.error("[upload] request error:", error)
    return null
  }
}
