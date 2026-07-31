/** Sort keys the list toolbar offers, mapped to the API's sort arguments. */
const SORT_MAP: Record<string, { sortBy: string; sortOrder: string }> = {
  newest: { sortBy: "created_at", sortOrder: "DESC" },
  oldest: { sortBy: "created_at", sortOrder: "ASC" },
  "a-z": { sortBy: "title", sortOrder: "ASC" },
  "z-a": { sortBy: "title", sortOrder: "DESC" },
  published: { sortBy: "status", sortOrder: "ASC" },
  draft: { sortBy: "status", sortOrder: "DESC" },
}

export interface ListParams {
  search: string | undefined
  sort: string
  sortBy: string
  sortOrder: string
  page: number
  limit: number
}

/**
 * Reads the shared `?q&sort&page&pageSize` contract the grid pages use. Unknown
 * sort keys fall back to "newest" rather than erroring, so a hand-edited URL
 * can never 500 a loader.
 */
export function readListParams(request: Request, defaultLimit = 12): ListParams {
  const params = new URL(request.url).searchParams

  const sort = params.get("sort") ?? "newest"
  const { sortBy, sortOrder } = SORT_MAP[sort] ?? SORT_MAP.newest

  const page = Number(params.get("page") ?? 1)
  const limit = Number(params.get("pageSize") ?? defaultLimit)

  return {
    search: params.get("q")?.trim() || undefined,
    sort,
    sortBy,
    sortOrder,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : defaultLimit,
  }
}

/** Client-side equivalent for the collections the API returns unpaginated. */
export function sortAndFilter<T>(
  rows: T[],
  {
    search,
    sort,
    nameOf,
    createdAtOf,
  }: {
    search: string | undefined
    sort: string
    nameOf: (row: T) => string
    createdAtOf: (row: T) => string
  }
): T[] {
  const needle = search?.toLowerCase()
  const filtered = needle
    ? rows.filter((row) => nameOf(row).toLowerCase().includes(needle))
    : [...rows]

  return filtered.sort((a, b) => {
    switch (sort) {
      case "a-z":
        return nameOf(a).localeCompare(nameOf(b))
      case "z-a":
        return nameOf(b).localeCompare(nameOf(a))
      case "oldest":
        return (
          new Date(createdAtOf(a)).getTime() - new Date(createdAtOf(b)).getTime()
        )
      default:
        return (
          new Date(createdAtOf(b)).getTime() - new Date(createdAtOf(a)).getTime()
        )
    }
  })
}
