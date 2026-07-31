import { apiBaseUrl } from "@academy/user-ui/lib/site-urls"

export interface UploadedFile {
  url: string
  filename: string
  size: number
}

/**
 * Uploads through the API's own storage endpoint (`POST /api/files/upload`,
 * multipart with `file` + optional `folder`), which puts the object in R2 and
 * returns its public URL. Runs in the browser so large files stream straight to
 * the API instead of round-tripping through our SSR server.
 */
export async function uploadFile(
  file: File,
  folder = "admin"
): Promise<UploadedFile> {
  const body = new FormData()
  body.append("file", file)
  body.append("folder", folder)

  const response = await fetch(`${apiBaseUrl()}/api/files/upload`, {
    method: "POST",
    body,
    // The endpoint is behind the same session cookie as the GraphQL API.
    credentials: "include",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(
      detail ? `No se pudo subir el archivo: ${detail}` : "No se pudo subir el archivo."
    )
  }

  const result = (await response.json()) as {
    success?: boolean
    url?: string
    filename?: string
    size?: number
    error?: string
  }

  if (!result.url) {
    throw new Error(result.error || "La respuesta de subida no incluyó una URL.")
  }

  return {
    url: result.url,
    filename: result.filename ?? file.name,
    size: result.size ?? file.size,
  }
}

/** 100 MB — matches the MaxBytesReader limit on the Go handler. */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
