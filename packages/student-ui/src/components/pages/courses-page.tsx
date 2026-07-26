import { cn } from "@academy/user-ui/lib/utils"
import {
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconHelpCircle,
  IconPlayerPlay,
  IconSearch,
  IconTrendingUp,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link } from "react-router"
import {
  StudentCourseCard,
  StudentCourseCardSkeleton,
} from "../course-card"
import type {
  CourseFilter,
  CoursesPageLabels,
  CourseSort,
  StudentCourseCardItem,
} from "../../types/courses"

const PAGE_SIZE = 6

export interface StudentCoursesPageProps {
  items: StudentCourseCardItem[]
  labels: CoursesPageLabels
  isLoading?: boolean
  /** Lang-scoped catalog link for the empty state. */
  exploreHref: string
  onStartCourse?: (courseId: string, href: string) => void
  /** Course id currently being started (disables just that CTA). */
  startingCourseId?: string | null
}

/**
 * "Mis Cursos". Filter/search/sort/page all live in the URL so the view is
 * shareable and survives reloads.
 *
 * Note the ordering: stats and filtering run over the FULL list, and only the
 * final result is sliced into a page — filtering a single page would make the
 * counts and results depend on which page you happened to be on.
 */
export function StudentCoursesPage({
  items,
  labels,
  isLoading,
  exploreHref,
  onStartCourse,
  startingCourseId,
}: StudentCoursesPageProps) {
  /**
   * All view state is local. Every enrollment is already in memory, so putting
   * this in the URL would make each keystroke/click a router navigation — and a
   * navigation revalidates *every* matched loader (root + layout's `getMe` +
   * this route), i.e. server roundtrips just to re-filter a client-side list.
   */
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<CourseFilter>("all")
  const [sort, setSort] = useState<CourseSort>("newest")
  const [page, setPage] = useState(1)

  const isCompleted = (item: StudentCourseCardItem) =>
    item.progressPercentage >= 100
  const isInProgress = (item: StudentCourseCardItem) =>
    item.progressPercentage > 0 && item.progressPercentage < 100
  const isNotStarted = (item: StudentCourseCardItem) =>
    item.progressPercentage <= 0

  const stats = {
    total: items.length,
    inProgress: items.filter(isInProgress).length,
    completed: items.filter(isCompleted).length,
    notStarted: items.filter(isNotStarted).length,
  }

  const matched = items.filter((item) => {
    if (query && !item.title.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    if (filter === "in_progress") return isInProgress(item)
    if (filter === "completed") return isCompleted(item)
    if (filter === "not_started") return isNotStarted(item)
    return true
  })

  const sorted = [...matched].sort((a, b) => {
    // Locked courses always sink to the bottom.
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1
    if (sort === "a-z") return a.title.localeCompare(b.title)
    if (sort === "z-a") return b.title.localeCompare(a.title)
    if (sort === "progress") return b.progressPercentage - a.progressPercentage
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return sort === "oldest" ? aTime - bTime : bTime - aTime
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Anything that changes the result set sends you back to the first page.
  const applyQuery = (value: string) => {
    setQuery(value)
    setPage(1)
  }
  const applyFilter = (value: CourseFilter) => {
    setFilter(value)
    setPage(1)
  }
  const applySort = (value: CourseSort) => {
    setSort(value)
    setPage(1)
  }
  const clearFilters = () => {
    setQuery("")
    setFilter("all")
    setPage(1)
  }

  const hasCourses = items.length > 0
  const isFiltering = Boolean(query) || filter !== "all"
  const showNoResults = hasCourses && isFiltering && sorted.length === 0

  const filterTabs: { value: CourseFilter; label: string; count: number }[] = [
    { value: "all", label: labels.filterAll, count: stats.total },
    {
      value: "in_progress",
      label: labels.filterInProgress,
      count: stats.inProgress,
    },
    {
      value: "completed",
      label: labels.filterCompleted,
      count: stats.completed,
    },
    {
      value: "not_started",
      label: labels.filterNotStarted,
      count: stats.notStarted,
    },
  ]

  const sortOptions: { value: CourseSort; label: string }[] = [
    { value: "newest", label: labels.sortNewest },
    { value: "oldest", label: labels.sortOldest },
    { value: "a-z", label: labels.sortAZ },
    { value: "z-a", label: labels.sortZA },
    { value: "progress", label: labels.sortProgress },
  ]

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-yellow p-2">
            <IconBook2 aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              {labels.pageTitle}
            </h1>
            <p className="text-sm text-content-muted">
              {stats.total}{" "}
              {stats.total === 1
                ? labels.totalSuffixSingular
                : labels.totalSuffixPlural}
            </p>
          </div>
        </div>
      </header>

      {!isLoading && hasCourses && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              icon={IconPlayerPlay}
              tone="bg-academy-blue"
              label={labels.statsInProgress}
              value={stats.inProgress}
            />
            <StatTile
              icon={IconCircleCheck}
              tone="bg-academy-green"
              label={labels.statsCompleted}
              value={stats.completed}
            />
            <StatTile
              icon={IconClock}
              tone="bg-surface-muted"
              label={labels.statsNotStarted}
              value={stats.notStarted}
            />
            <StatTile
              icon={IconTrendingUp}
              tone="bg-academy-yellow"
              label={labels.statsOverall}
              value={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
            />
          </div>

          <div className="flex flex-col gap-stack">
            <div className="relative">
              <IconSearch
                aria-hidden
                className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-content-muted"
              />
              <input
                type="search"
                aria-label={labels.searchAria}
                placeholder={labels.searchPlaceholder}
                value={query}
                onChange={(event) => applyQuery(event.target.value)}
                className="w-full rounded-card border-2 border-border-strong bg-surface-card py-3 pr-4 pl-12 font-bold shadow-hard-xs placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-stack">
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    aria-pressed={filter === tab.value}
                    onClick={() => applyFilter(tab.value)}
                    className={cn(
                      "rounded-button border-2 border-border-strong px-4 py-2 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                      filter === tab.value
                        ? "bg-academy-ink text-content-inverse shadow-hard-sm"
                        : "bg-surface-card shadow-hard-xs"
                    )}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="courses-sort"
                  className="text-sm font-bold whitespace-nowrap"
                >
                  {labels.sortLabel}
                </label>
                <select
                  id="courses-sort"
                  value={sort}
                  onChange={(event) =>
                    applySort(event.target.value as CourseSort)
                  }
                  className="rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm font-bold text-content-muted" aria-live="polite">
              {sorted.length}{" "}
              {sorted.length === 1
                ? labels.resultsSingular
                : labels.resultsPlural}
            </p>
          </div>
        </>
      )}

      {isLoading && (
        <div className="grid w-full gap-stack md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <StudentCourseCardSkeleton key={index} />
          ))}
        </div>
      )}

      {showNoResults && (
        <EmptyPanel
          icon={IconSearch}
          tone="bg-surface-muted"
          title={labels.noResultsTitle}
          description={
            query
              ? labels.noResultsWithQuery.replace("{query}", query)
              : labels.noResultsInCategory
          }
        >
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.clearFiltersCta}
          </button>
        </EmptyPanel>
      )}

      {!isLoading && !hasCourses && (
        <EmptyPanel
          icon={IconHelpCircle}
          tone="bg-academy-yellow"
          title={labels.emptyTitle}
          description={labels.emptyDescription}
        >
          <Link
            to={exploreHref}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.emptyCta}
          </Link>
        </EmptyPanel>
      )}

      {!isLoading && visible.length > 0 && (
        <div className="grid w-full gap-stack md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <StudentCourseCard
              key={item.id}
              item={item}
              labels={labels.card}
              onStart={onStartCourse}
              isStarting={startingCourseId === item.courseId}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label={labels.paginationAria}
          className="flex items-center justify-center gap-2"
        >
          <PageButton
            label={labels.prevPageLabel}
            disabled={currentPage <= 1}
            onClick={() =>
              setPage(currentPage - 1)
            }
          >
            <IconChevronLeft aria-hidden className="size-4" />
          </PageButton>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1
            return (
              <PageButton
                key={pageNumber}
                label={labels.pageLabel.replace("{n}", String(pageNumber))}
                current={pageNumber === currentPage}
                onClick={() =>
                  setPage(pageNumber)
                }
              >
                {pageNumber}
              </PageButton>
            )
          })}
          <PageButton
            label={labels.nextPageLabel}
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage(currentPage + 1)
            }
          >
            <IconChevronRight aria-hidden className="size-4" />
          </PageButton>
        </nav>
      )}
    </div>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconClock
  tone: string
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-card p-4 shadow-hard-sm">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-button border-2 border-border-strong",
          tone
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-none font-bold tabular-nums">{value}</p>
        <p className="truncate text-label font-bold text-content-muted">
          {label}
        </p>
      </div>
    </div>
  )
}

function EmptyPanel({
  icon: Icon,
  tone,
  title,
  description,
  children,
}: {
  icon: typeof IconSearch
  tone: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
      <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-card border-2 border-border-strong",
            tone
          )}
        >
          <Icon aria-hidden className="size-8" />
        </span>
        <h2 className="text-card-title font-bold tracking-tight-brand">
          {title}
        </h2>
        <p className="text-content-muted">{description}</p>
        {children}
      </div>
    </div>
  )
}

function PageButton({
  children,
  label,
  current,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  label: string
  current?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-button border-2 border-border-strong font-bold transition-all duration-150 ease-academy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
        current
          ? "bg-academy-ink text-content-inverse"
          : "bg-surface-card shadow-hard-xs hover:-translate-y-0.5",
        disabled && "cursor-not-allowed opacity-50 hover:translate-y-0"
      )}
    >
      {children}
    </button>
  )
}
