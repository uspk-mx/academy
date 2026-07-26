/**
 * Pure formatting helpers — deliberately free of API/GraphQL types so sibling
 * UI packages can use them without pulling in the whole `courses-api` graph.
 * `types/api` re-exports these to keep existing imports working.
 */

/** Whole-MXN number as returned by the courses API. */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("es-MX")} MX`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, "0")}m`
}
