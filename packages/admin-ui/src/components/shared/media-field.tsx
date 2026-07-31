import {
  IconLoader2,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react"
import { useRef, useState } from "react"

import { Field } from "@academy/admin-ui/components/ui/field"
import { Input } from "@academy/admin-ui/components/ui/input"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import {
  MAX_UPLOAD_BYTES,
  formatBytes,
  uploadFile,
} from "@academy/admin-ui/lib/upload"

/**
 * File picker backed by the API's R2 upload endpoint. The resulting URL is what
 * gets submitted (`name`), so every consumer stays a plain string field — and
 * an existing URL can still be pasted, which matters for assets that live
 * outside our bucket.
 */
export function MediaField({
  label,
  name,
  defaultValue,
  folder = "admin",
  hint,
  accept = "image/*",
  required,
  preview = true,
}: {
  label: string
  name: string
  defaultValue?: string | null
  /** Bucket prefix, e.g. "courses" or "lessons". */
  folder?: string
  hint?: string
  accept?: string
  required?: boolean
  /** Thumbnails only make sense for images. */
  preview?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPick = async (file: File | undefined) => {
    if (!file) return

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`El archivo supera el límite de ${formatBytes(MAX_UPLOAD_BYTES)}.`)
      return
    }

    setError(null)
    setUploading(true)
    try {
      const uploaded = await uploadFile(file, folder)
      setUrl(uploaded.url)
    } catch (uploadError: any) {
      setError(String(uploadError?.message ?? "No se pudo subir el archivo."))
    } finally {
      setUploading(false)
      // Let the same file be re-picked after a failure.
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-card p-2 shadow-hard-xs">
          {preview ? (
            <img
              src={url}
              alt=""
              className="size-14 shrink-0 rounded-[calc(var(--radius-card)-8px)] border-2 border-border-strong object-cover"
            />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-[calc(var(--radius-card)-8px)] border-2 border-border-strong bg-academy-yellow-soft">
              <IconPhoto className="size-5" />
            </span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 flex-1 text-sm break-all text-action-secondary underline-offset-2 hover:underline"
          >
            {url}
          </a>
          <IconButton
            destructive
            aria-label={`Quitar ${label.toLowerCase()}`}
            onClick={() => setUrl("")}
          >
            <IconX className="size-4" />
          </IconButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-border-strong bg-surface-card px-4 py-6 text-sm font-bold transition-colors hover:bg-academy-yellow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:opacity-60"
          >
            {uploading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <IconUpload className="size-4" />
                Subir archivo
              </>
            )}
          </button>

          <Input
            value=""
            onChange={(event) => setUrl(event.target.value)}
            placeholder="…o pega una URL"
            aria-label={`URL de ${label.toLowerCase()}`}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onPick(event.target.files?.[0])}
      />
    </Field>
  )
}
