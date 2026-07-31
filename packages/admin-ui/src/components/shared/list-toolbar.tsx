import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"

export const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "a-z", label: "A - Z" },
  { value: "z-a", label: "Z - A" },
] as const

export const PUBLISH_SORT_OPTIONS = [
  ...SORT_OPTIONS,
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
] as const

/**
 * Search + sort + primary CTA above every list. Both controls write to the URL,
 * which is what the loaders read — so filtering is a normal navigation and
 * survives a refresh or a shared link.
 */
export function ListToolbar({
  ctaLabel,
  ctaHref,
  onCtaClick,
  ctaDisabled,
  hasPublishFilters = false,
  searchPlaceholder = "Buscar...",
}: {
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  ctaDisabled?: boolean
  hasPublishFilters?: boolean
  searchPlaceholder?: string
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(urlQuery)

  // Keep the field in sync when the URL changes from elsewhere (back button,
  // a link, the pagination controls).
  useEffect(() => setQuery(urlQuery), [urlQuery])

  const sortOptions = hasPublishFilters ? PUBLISH_SORT_OPTIONS : SORT_OPTIONS
  const sort = searchParams.get("sort") ?? "newest"

  const commit = (next: URLSearchParams) => {
    // Any filter change invalidates the current page offset.
    next.delete("page")
    setSearchParams(next, { preventScrollReset: true })
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        className="relative w-full sm:max-w-xs"
        onSubmit={(event) => {
          event.preventDefault()
          const next = new URLSearchParams(searchParams)
          if (query) next.set("q", query)
          else next.delete("q")
          commit(next)
        }}
      >
        <IconSearch className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-muted" />
        <Input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10"
          aria-label="Buscar"
        />
      </form>

      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(value) => {
            const next = new URLSearchParams(searchParams)
            next.set("sort", String(value))
            commit(next)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {ctaLabel &&
          (ctaHref ? (
            <BrandButton to={ctaHref} variant="promo">
              <IconPlus className="size-4" strokeWidth={2.5} />
              {ctaLabel}
            </BrandButton>
          ) : (
            <BrandButton
              onClick={onCtaClick}
              variant="promo"
              disabled={ctaDisabled}
            >
              <IconPlus className="size-4" strokeWidth={2.5} />
              {ctaLabel}
            </BrandButton>
          ))}
      </div>
    </div>
  )
}
