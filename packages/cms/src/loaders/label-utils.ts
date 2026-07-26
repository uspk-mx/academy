/**
 * Overlay CMS-fetched values onto default labels: for every key in `defaults`,
 * take the CMS value when it's a non-empty string, else keep the default.
 * `rename` maps a defaults key to its CMS field name (e.g. errors.required →
 * errorRequired). Unfilled/absent CMS fields safely fall back.
 */
export function fillLabels<T extends Record<keyof T, string>>(
  defaults: T,
  cms: Record<string, unknown> | null | undefined,
  rename?: (key: string) => string
): T {
  const out = { ...defaults }
  if (!cms) return out
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = cms[rename ? rename(key) : key]
    if (typeof value === "string" && value.length > 0) {
      out[key] = value as T[keyof T & string]
    }
  }
  return out
}
