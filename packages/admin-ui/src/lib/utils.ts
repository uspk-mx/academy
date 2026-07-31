export { cn } from "@academy/user-ui/lib/utils"

/** Only local paths — never absolute/protocol-relative URLs (open redirect). */
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return fallback
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "America/Mexico_City",
})

/** "12 mar 2026" — the format every admin table uses for timestamps. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0)
}

/** "Actualizado hace 3 días" for the course/bundle cards. */
export function relativeUpdatedLabel(value: string | null | undefined): string {
  if (!value) return "Fecha no disponible"
  const updatedAt = new Date(value)
  if (Number.isNaN(updatedAt.getTime())) return "Fecha no disponible"

  const days = Math.floor((Date.now() - updatedAt.getTime()) / 86_400_000)
  if (days <= 0) return "Actualizado hoy"
  return `Actualizado hace ${days} día${days > 1 ? "s" : ""}`
}
