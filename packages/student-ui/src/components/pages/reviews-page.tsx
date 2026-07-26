import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@academy/user-ui/components/ui/dialog"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAward,
  IconBook2,
  IconFilter,
  IconPencil,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconTrendingUp,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link, useFetcher } from "react-router"
import {
  REVIEW_COMMENT_MAX_LENGTH,
  type ReviewActionData,
  type ReviewableCourse,
  type ReviewErrorLabels,
  type ReviewRatingFilter,
  type ReviewsPageLabels,
  type StudentReview,
} from "../../types/reviews"

export interface StudentReviewsPageProps {
  items: StudentReview[]
  labels: ReviewsPageLabels
  /** Enrolled courses without a review yet — the API allows only one each. */
  reviewableCourses: ReviewableCourse[]
  /** Lang-scoped "Mis Cursos" link for the empty state. */
  coursesHref: string
}

/** Which modal is open, and what it is acting on. */
type ModalState =
  | { kind: "create" }
  | { kind: "edit"; review: StudentReview }
  | { kind: "delete"; review: StudentReview }
  | null

function errorText(
  code: string | undefined,
  errors: ReviewErrorLabels
): string | undefined {
  if (!code) return undefined
  return errors[code as keyof ReviewErrorLabels] ?? errors.generic
}

const RATING_FILTERS: ReviewRatingFilter[] = ["all", "5", "4", "3", "2", "1"]

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}

/**
 * "Mis Reseñas". Stats are computed over the FULL list and only the cards are
 * filtered, so the totals don't shift as you change the filter.
 *
 * Every mutation goes through one fetcher to the route action. `fetcher.data`
 * always holds the most recent submission's result, so the error banner needs
 * no dismissal bookkeeping — a new submit replaces it, and success clears it.
 */
export function StudentReviewsPage({
  items,
  labels,
  reviewableCourses,
  coursesHref,
}: StudentReviewsPageProps) {
  // Local state: the whole list is already in memory, so filtering client-side
  // costs nothing, while a URL param would revalidate every matched loader.
  const [filter, setFilter] = useState<ReviewRatingFilter>("all")
  const [modal, setModal] = useState<ModalState>(null)
  const fetcher = useFetcher<ReviewActionData>()

  const failure = errorText(fetcher.data?.error, labels.errors)
  const canCreate = reviewableCourses.length > 0

  const total = items.length
  const average =
    total > 0
      ? (items.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)
      : "0.0"

  const countFor = (rating: number) =>
    items.filter((item) => item.rating === rating).length

  const visible =
    filter === "all"
      ? items
      : items.filter((item) => item.rating === Number(filter))

  const hasReviews = total > 0
  const showNoResults = hasReviews && visible.length === 0

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="flex flex-wrap items-center justify-between gap-stack rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-yellow p-2">
            <IconStarFilled aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              {labels.pageTitle}
            </h1>
            {hasReviews && (
              <p className="text-sm text-content-muted">
                {total}{" "}
                {total === 1
                  ? labels.totalSuffixSingular
                  : labels.totalSuffixPlural}{" "}
                • {labels.averageSuffix}: {average} ⭐
              </p>
            )}
          </div>
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <IconPlus aria-hidden className="size-4" />
            {labels.writeReviewCta}
          </button>
        ) : (
          hasReviews && (
            <p className="text-sm font-bold text-content-muted">
              {labels.allCoursesReviewed}
            </p>
          )
        )}
      </header>

      {failure && (
        <p
          role="alert"
          className="rounded-card border-2 border-border-strong bg-academy-coral-soft p-3 text-sm font-bold"
        >
          {failure}
        </p>
      )}

      {hasReviews && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              icon={IconBook2}
              tone="bg-academy-blue"
              label={labels.statsTotal}
              value={total}
            />
            <StatTile
              icon={IconStarFilled}
              tone="bg-academy-yellow"
              label={labels.statsAverage}
              value={average}
            />
            <StatTile
              icon={IconAward}
              tone="bg-academy-green"
              label={labels.statsFiveStars}
              value={countFor(5)}
            />
            <StatTile
              icon={IconTrendingUp}
              tone="bg-surface-muted"
              label={labels.statsFourStars}
              value={countFor(4)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{labels.filterLabel}</span>
            {RATING_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-button border-2 border-border-strong px-4 py-2 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
                  filter === value
                    ? "bg-academy-ink text-content-inverse shadow-hard-sm"
                    : "bg-surface-card shadow-hard-xs"
                )}
              >
                {value === "all"
                  ? labels.filterAll
                  : labels.filterStars.replace("{n}", value)}
              </button>
            ))}
            <p
              className="ml-2 text-sm font-bold text-content-muted"
              aria-live="polite"
            >
              ({visible.length}{" "}
              {visible.length === 1
                ? labels.resultsSingular
                : labels.resultsPlural}
              )
            </p>
          </div>
        </>
      )}

      {!hasReviews && (
        <EmptyPanel
          icon={IconStar}
          tone="bg-academy-yellow"
          title={labels.emptyTitle}
          description={labels.emptyDescription}
        >
          <Link
            to={coursesHref}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.emptyCta}
          </Link>
        </EmptyPanel>
      )}

      {showNoResults && (
        <EmptyPanel
          icon={IconFilter}
          tone="bg-surface-muted"
          title={labels.noResultsTitle}
          description={labels.noResultsDescription}
        >
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            {labels.clearFilterCta}
          </button>
        </EmptyPanel>
      )}

      {visible.length > 0 && (
        <div className="grid gap-stack md:grid-cols-2">
          {visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              labels={labels}
              onEdit={() => setModal({ kind: "edit", review })}
              onDelete={() => setModal({ kind: "delete", review })}
            />
          ))}
        </div>
      )}

      {/*
        Mounted only while open, so each modal starts from the current server
        data — no reset bookkeeping, and no stale draft from a previous open.
      */}
      {modal?.kind !== "delete" && modal !== null && (
        <ReviewFormDialog
          key={modal.kind === "edit" ? modal.review.id : "create"}
          labels={labels}
          review={modal.kind === "edit" ? modal.review : undefined}
          reviewableCourses={reviewableCourses}
          isSubmitting={fetcher.state !== "idle"}
          onClose={() => setModal(null)}
          fetcher={fetcher}
        />
      )}

      {modal?.kind === "delete" && (
        <DeleteReviewDialog
          labels={labels}
          review={modal.review}
          isSubmitting={fetcher.state !== "idle"}
          onClose={() => setModal(null)}
          fetcher={fetcher}
        />
      )}
    </div>
  )
}

type ReviewFetcher = ReturnType<typeof useFetcher<ReviewActionData>>

/**
 * Create and edit share one form: the only differences are the course field
 * (a picker when creating, fixed when editing) and the intent.
 *
 * Submitting closes the modal right away rather than waiting for the response.
 * The alternative — closing when the fetcher goes idle — has to tell a fresh
 * result from the previous one, and `fetcher.data` alone can't. The list
 * revalidates a moment later, and a genuine failure surfaces in the banner.
 */
function ReviewFormDialog({
  labels,
  review,
  reviewableCourses,
  isSubmitting,
  onClose,
  fetcher,
}: {
  labels: ReviewsPageLabels
  review?: StudentReview
  reviewableCourses: ReviewableCourse[]
  isSubmitting: boolean
  onClose: () => void
  fetcher: ReviewFetcher
}) {
  const isEdit = Boolean(review)
  const [rating, setRating] = useState(review?.rating ?? 5)
  const [comment, setComment] = useState(review?.comment ?? "")

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-card-title font-bold tracking-tight-brand">
            {isEdit ? labels.editModalTitle : labels.createModalTitle}
          </DialogTitle>
          {isEdit && (
            <DialogDescription className="font-bold text-content-muted">
              {review?.courseTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <fetcher.Form
          method="post"
          onSubmit={onClose}
          className="flex flex-col gap-stack"
        >
          <input
            type="hidden"
            name="intent"
            value={isEdit ? "update" : "create"}
          />
          {isEdit && <input type="hidden" name="id" value={review?.id} />}
          <input type="hidden" name="rating" value={rating} />

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="courseId" className="font-bold">
                {labels.courseFieldLabel}
              </label>
              <select
                id="courseId"
                name="courseId"
                required
                defaultValue=""
                className="rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
              >
                <option value="" disabled>
                  {labels.coursePlaceholder}
                </option>
                {reviewableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="flex flex-col gap-1.5 border-0 p-0">
            <legend className="font-bold">{labels.ratingFieldLabel}</legend>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rating === value}
                    aria-label={labels.starAria.replace("{n}", String(value))}
                    onClick={() => setRating(value)}
                    className="rounded-button p-1 transition-transform duration-150 ease-academy hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                  >
                    <IconStarFilled
                      aria-hidden
                      className={cn(
                        "size-8",
                        value <= rating
                          ? "text-academy-yellow"
                          : "text-border-subtle"
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="comment" className="font-bold">
                {labels.commentFieldLabel}
              </label>
              <span className="text-label text-content-muted tabular-nums">
                {labels.charCounter
                  .replace("{n}", String(comment.length))
                  .replace("{max}", String(REVIEW_COMMENT_MAX_LENGTH))}
              </span>
            </div>
            <textarea
              id="comment"
              name="comment"
              required
              rows={5}
              maxLength={REVIEW_COMMENT_MAX_LENGTH}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={labels.commentPlaceholder}
              className="rounded-card border-2 border-border-strong bg-surface-card p-3 font-medium placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs"
            >
              {labels.cancelCta}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-green px-4 py-2 font-bold text-content-inverse shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting
                ? labels.savingCta
                : isEdit
                  ? labels.saveCta
                  : labels.createCta}
            </button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteReviewDialog({
  labels,
  review,
  isSubmitting,
  onClose,
  fetcher,
}: {
  labels: ReviewsPageLabels
  review: StudentReview
  isSubmitting: boolean
  onClose: () => void
  fetcher: ReviewFetcher
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <DialogHeader>
          <DialogTitle className="text-card-title font-bold tracking-tight-brand">
            {labels.deleteModalTitle}
          </DialogTitle>
          <DialogDescription className="text-content-muted">
            {labels.deleteConfirmation.replace("{course}", review.courseTitle)}
          </DialogDescription>
        </DialogHeader>

        <fetcher.Form
          method="post"
          onSubmit={onClose}
          className="flex justify-end gap-2"
        >
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={review.id} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs"
          >
            {labels.cancelCta}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-coral px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm disabled:pointer-events-none disabled:opacity-60"
          >
            <IconTrash aria-hidden className="size-4" />
            {labels.confirmDeleteCta}
          </button>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}

function ReviewCard({
  review,
  labels,
  onEdit,
  onDelete,
}: {
  review: StudentReview
  labels: ReviewsPageLabels
  onEdit: () => void
  onDelete: () => void
}) {
  const createdAt = formatDate(review.createdAt)

  return (
    <article className="group overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg">
      <div className="relative aspect-video overflow-hidden border-b-2 border-border-strong bg-surface-muted">
        {review.courseImage ? (
          <img
            src={review.courseImage}
            alt=""
            className="size-full object-cover transition-transform duration-300 ease-academy group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <IconBook2 aria-hidden className="size-12 text-content-muted" />
          </div>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-button border-2 border-border-strong bg-surface-card px-2 py-1 shadow-hard-xs">
          <IconStarFilled aria-hidden className="size-4 text-academy-yellow" />
          <span className="text-sm font-bold">{review.rating}/5</span>
        </span>
      </div>

      <div className="flex flex-col gap-3 p-card">
        <div>
          <h2 className="line-clamp-1 text-card-title font-bold tracking-tight-brand">
            {review.courseTitle}
          </h2>
          {review.instructor && (
            <p className="text-label text-content-muted">
              por {review.instructor}
            </p>
          )}
        </div>

        <Stars
          rating={review.rating}
          label={labels.ratingAria.replace("{n}", String(review.rating))}
        />

        <p className="line-clamp-3 text-sm text-content-muted">
          {review.comment}
        </p>

        <div className="flex items-center justify-between border-t-2 border-border-subtle pt-3 text-label font-bold text-content-muted">
          <span>{createdAt ?? "—"}</span>
          <span>
            {review.likes} {labels.likesSuffix}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-3 py-2 text-sm font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <IconPencil aria-hidden className="size-4" />
            {labels.editCta}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-academy-coral-soft px-3 py-2 text-sm font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <IconTrash aria-hidden className="size-4" />
            {labels.deleteCta}
          </button>
        </div>
      </div>
    </article>
  )
}

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, index) => (
        <IconStarFilled
          key={index}
          aria-hidden
          className={cn(
            "size-4",
            index < rating ? "text-academy-yellow" : "text-border-subtle"
          )}
        />
      ))}
    </div>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconStar
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
  icon: typeof IconStar
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
