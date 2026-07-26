import { CoursesData } from "@academy/courses-api/graphql/queries/courses"
import { cn } from "@academy/user-ui/lib/utils"
import {
  CatalogCategoryCard,
  CatalogHeroContent,
  CatalogUpsellContent,
} from "@academy/user-ui/types/cms"
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react"
import { Form, useSearchParams } from "react-router"
import { Pill, toneBg, toneSoftBg } from "../brand/primitives"
import { RichtTitle } from "../brand/section-heading"
import { CourseGrid , type CourseCardLabels } from "../course/course-card"
import {
  CatalogUpsellCard,
  CourseFilters,
  CourseFiltersState,
  FilterGroup,
} from "../course/course-filters"
import { FloatingPills } from "../marketing/home-hero"

/** Decorative category card: tone outer card, soft inner panel with the
 *  3D illustration, bold label below — per the Canva reference. */
function CategoryCard({
  card,
  className,
}: {
  card: CatalogCategoryCard
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute w-40 rounded-card-lg border-2 border-border-strong p-2.5 pb-3 shadow-hard-sm",
        toneBg[card.tone],
        className
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-card border-2 border-border-strong",
          toneSoftBg[card.tone]
        )}
      >
        {card?.url ? (
          <img
            src={card.url}
            alt={card.alt}
            className="aspect-square w-full object-contain p-3"
          />
        ) : (
          <div className="aspect-square w-full object-contain p-3">IMG</div>
        )}
      </div>
      <p className="mt-2 pl-1 text-sm font-bold tracking-tight-brand text-content-primary">
        {card.label}
      </p>
    </div>
  )
}

/** rotation + position + stacking per slot, echoing the reference collage */
const cardSlots = [
  "-rotate-6 left-19 top-2 z-0",
  "rotate-6 right-2 top-0 z-10",
  "-rotate-3 bottom-0 left-14 z-20",
  "rotate-3 -bottom-4 right-8 z-30",
]

function CatalogHero({
  content,
  a11y,
}: {
  content: CatalogHeroContent
  a11y: CoursesA11yLabels
}) {
  return (
    <section className="border-b-2 border-border-strong">
      <div className="mx-auto grid items-center gap-stack-lg px-page-x py-stack-lg md:grid-cols-2 md:py-section-y">
        <div className="flex flex-col items-start gap-stack-lg">
          {content.promoBadge && (
            <Pill className="text-sm">
              <span
                aria-hidden
                className="size-2 rounded-pill bg-academy-coral"
              />
              {content.promoBadge}
            </Pill>
          )}
          <h1 className="text-page-title leading-display font-bold tracking-display">
            <RichtTitle segments={content.title} />
          </h1>
          <p className="max-w-md text-sm leading-body text-content-muted">
            {content.subtitle}
          </p>

          {/* GET form → ?q= handled by the route loader */}
          <Form method="get" role="search" className="w-full max-w-md">
            <div className="flex items-center gap-2 rounded-pill border-2 border-border-strong bg-surface-card py-1.5 pr-1.5 pl-4 shadow-hard-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-academy-yellow">
              <IconSearch
                aria-hidden
                className="size-4 shrink-0 text-content-muted"
              />
              <input
                type="text"
                name="q"
                placeholder={content.searchPlaceholder}
                aria-label={a11y.searchAria}
                className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-pill bg-academy-ink px-4 py-1.5 text-sm font-bold text-content-inverse"
              >
                {a11y.searchSubmitLabel}
              </button>
            </div>
          </Form>
        </div>

        {content.cards && (
          <div
            aria-hidden
            className="relative mx-auto hidden h-96 w-full max-w-md md:block"
          >
            <FloatingPills
              positions={[
                { tone: "coral", className: "left-10 top-8 z-22" },
                { tone: "green", className: "right-0 top-4 z-22" },
                { tone: "yellow", className: "bottom-6 left-8 z-22" },
              ]} z-22
            />
            {content.cards.map((card, i) => (
              <CategoryCard
                key={card.label}
                card={card}
                className={cardSlots[i % 4]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Search/navigation labels (mostly screen-reader); CMS-provided. */
export interface CoursesA11yLabels {
  searchAria: string
  searchSubmitLabel: string
  resultsAria: string
  paginationAria: string
  prevPageLabel: string
  nextPageLabel: string
  /** "{n}" is replaced with the page number. */
  pageLabel: string
  maxPriceAria: string
}

export interface CoursesPageProps {
  hero: CatalogHeroContent
  upsell: CatalogUpsellContent
  courses: CoursesData["courses"]["course"]
  totalCount: number
  filterGroups: FilterGroup[]
  page: number
  hasNextPage: boolean
  /** e.g. "cursos encontrados" — rendered after the count. */
  resultsLabel: string
  a11y: CoursesA11yLabels
  cardLabels?: CourseCardLabels
}

const MAX_PRICE = 200
const PRICE_PARAM = "maxPrice"
const emptyFilters: CourseFiltersState = { selected: {}, maxPrice: MAX_PRICE }

/** Read the filter state out of the URL so it survives reloads and is shareable. */
function filtersFromParams(
  params: URLSearchParams,
  groupIds: string[]
): CourseFiltersState {
  const selected: Record<string, string[]> = {}
  for (const id of groupIds) {
    const values = params.getAll(id)
    if (values.length) selected[id] = values
  }
  const maxPrice = params.get(PRICE_PARAM)
  return { selected, maxPrice: maxPrice ? Number(maxPrice) : MAX_PRICE }
}

/** Serialize the filter state back into a fresh URLSearchParams, preserving
 *  loader-owned params (`q`) and resetting pagination on any filter change. */
function paramsFromFilters(
  params: URLSearchParams,
  next: CourseFiltersState,
  groupIds: string[]
): URLSearchParams {
  const result = new URLSearchParams(params)
  for (const id of groupIds) result.delete(id)
  result.delete(PRICE_PARAM)
  result.delete("page")

  for (const id of groupIds) {
    for (const value of next.selected[id] ?? []) result.append(id, value)
  }
  if (next.maxPrice !== MAX_PRICE) {
    result.set(PRICE_PARAM, String(next.maxPrice))
  }
  return result
}

export function CoursePage({
  hero,
  upsell,
  courses,
  totalCount,
  filterGroups,
  page,
  hasNextPage,
  resultsLabel,
  a11y,
  cardLabels,
}: CoursesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const groupIds = filterGroups.map((group) => group.id)

  // Filter state is derived from the URL rather than local state, so it's
  // shareable, survives reloads, and drives the loader refetch (the `courses`
  // query filters by category/level/duration/price server-side).
  const filters = filtersFromParams(searchParams, groupIds)
  const setFilters = (next: CourseFiltersState) =>
    setSearchParams(paramsFromFilters(searchParams, next, groupIds))

  const handlePageIndex = (value: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", value.toString())
    setSearchParams(newParams)
  }

  return (
    <main className="bg-surface-page">
      <CatalogHero content={hero} a11y={a11y} />
      <div className="mx-auto grid items-start gap-stack-lg px-page-x py-section-y lg:grid-cols-[16rem_1fr]">
        <div className="flex flex-col gap-stack-lg lg:sticky lg:top-6">
          <CourseFilters
            groups={filterGroups}
            priceRange={{ min: 0, max: MAX_PRICE }}
            value={filters}
            onChange={setFilters}
            priceLabel={filterGroups[0].priceLabel}
            onClear={() => setFilters(emptyFilters)}
            maxPriceAria={a11y.maxPriceAria}
          />
          <CatalogUpsellCard content={upsell} />
        </div>

        <section aria-label={a11y.resultsAria}>
          <p className="pb-stack text-sm text-content-muted" aria-live="polite">
            <span className="font-bold text-content-primary">{totalCount}</span>{" "}
            {resultsLabel}
          </p>

          <CourseGrid
            courses={courses}
            columns={2}
            className="xl:grid-cols-3"
            labels={cardLabels}
          />

          <Pagination
            page={page}
            hasNextPage={hasNextPage}
            onPageChange={handlePageIndex}
            a11y={a11y}
          />
        </section>
      </div>
    </main>
  )
}

function Pagination({
  page,
  hasNextPage,
  onPageChange,
  a11y,
}: {
  page: number
  hasNextPage: boolean
  onPageChange: (value: number) => void
  a11y: CoursesA11yLabels
}) {
  const pagesToShow = [page]
  if (!hasNextPage) return null
  if (page > 1) pagesToShow.unshift(page - 1)
  if (hasNextPage) pagesToShow.push(page + 1)

  return (
    <nav
      aria-label={a11y.paginationAria}
      className="mt-stack-lg flex justify-center gap-2"
    >
      <PageButton
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
        label={a11y.prevPageLabel}
      >
        <IconChevronLeft aria-hidden className="size-4" />
      </PageButton>
      {pagesToShow.map((n) => (
        <PageButton
          key={n}
          onClick={() => onPageChange(n)}
          current={n === page}
          label={a11y.pageLabel.replace("{n}", String(n))}
        >
          {n}
        </PageButton>
      ))}
      <PageButton
        onClick={() => onPageChange?.(page + 1)}
        disabled={!hasNextPage}
        label={a11y.nextPageLabel}
      >
        <IconChevronRight aria-hidden className="size-4" />
      </PageButton>
    </nav>
  )
}

function PageButton({
  children,
  onClick,
  disabled,
  current,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  current?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex size-9 items-center justify-center rounded-pill border-2 border-border-strong text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:opacity-40",
        current
          ? "bg-academy-ink text-content-inverse"
          : "bg-surface-card hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  )
}
