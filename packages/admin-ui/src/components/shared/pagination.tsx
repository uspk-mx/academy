import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useSearchParams } from "react-router"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"

/**
 * Page controls for the API-paginated grids. Page number lives in the URL, so
 * the loader is the single source of truth and back/forward behave.
 */
export function Pagination({
  page,
  limit,
  totalCount,
  hasNextPage,
}: {
  page: number
  limit: number
  totalCount: number
  hasNextPage: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  if (totalPages <= 1) return null

  const goTo = (next: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(next))
    setSearchParams(params, { preventScrollReset: true })
  }

  return (
    <div className="flex w-full items-center justify-between text-label text-content-muted">
      <span className="font-semibold">
        Página {page} de {totalPages} · {totalCount} resultados
      </span>
      <div className="flex items-center gap-2">
        <BrandButton
          variant="outline"
          size="sm"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <IconChevronLeft className="size-4" strokeWidth={2.5} />
        </BrandButton>
        <BrandButton
          variant="outline"
          size="sm"
          onClick={() => goTo(page + 1)}
          disabled={!hasNextPage}
          aria-label="Página siguiente"
        >
          <IconChevronRight className="size-4" strokeWidth={2.5} />
        </BrandButton>
      </div>
    </div>
  )
}
