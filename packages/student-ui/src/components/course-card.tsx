import { Skeleton } from "@academy/user-ui/components/ui/skeleton"
import { cn } from "@academy/user-ui/lib/utils"
import { formatDuration } from "@academy/user-ui/lib/format"
import {
  IconAward,
  IconCircleCheck,
  IconClock,
  IconLock,
} from "@tabler/icons-react"
import { Link } from "react-router"
import type { CourseCardLabels, StudentCourseCardItem } from "../types/courses"

const ctaClasses =
  "inline-flex w-full items-center justify-center rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2.5 font-bold tracking-tight-brand shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-60"

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/uspk/image/upload/v1737397211/web_assets/e023e32c-069c-4212-8bfa-c418692f54cf.png"

export interface StudentCourseCardProps {
  item: StudentCourseCardItem
  labels: CourseCardLabels
  /**
   * Called for a not-yet-started course so the route can record progress
   * (`startCourseProgress`) and *then* navigate. Without it the card links
   * straight to the first lesson and no progress row is created.
   */
  onStart?: (courseId: string, href: string) => void
  /** Disables the CTA while the start mutation is in flight. */
  isStarting?: boolean
}

export function StudentCourseCard({
  item,
  labels,
  onStart,
  isStarting,
}: StudentCourseCardProps) {
  const progress = Math.round(item.progressPercentage)
  const isCompleted = progress >= 100
  const { isStarted, isUnlocked } = item

  const accent = isCompleted
    ? "border-academy-green"
    : isStarted
      ? "border-academy-blue"
      : "border-border-strong"

  const cta = !isUnlocked
    ? labels.lockedCta
    : isCompleted
      ? labels.reviewCta
      : isStarted
        ? labels.continueCta
        : labels.startCta

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border-2 bg-surface-card shadow-hard-sm transition-all duration-150 ease-academy",
        accent,
        isUnlocked && "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg"
      )}
    >
      <div className="relative aspect-video overflow-hidden border-b-2 border-border-strong">
        <img
          src={item.imageUrl || FALLBACK_IMAGE}
          alt=""
          loading="lazy"
          className={cn(
            "size-full object-cover transition-transform duration-300 ease-academy",
            isUnlocked && "group-hover:scale-105",
            !isUnlocked && "grayscale"
          )}
        />

        {isCompleted && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border-2 border-border-strong bg-academy-green px-3 py-1 text-label font-bold text-content-inverse">
            <IconCircleCheck aria-hidden className="size-3.5" />
            {labels.completedBadge}
          </span>
        )}
        {!isCompleted && isStarted && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border-2 border-border-strong bg-academy-blue px-3 py-1 text-label font-bold text-content-inverse">
            <IconClock aria-hidden className="size-3.5" />
            {labels.inProgressBadge}
          </span>
        )}
        {!isUnlocked && (
          <span
            className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border-2 border-border-strong bg-surface-muted px-3 py-1 text-label font-bold"
            title={
              item.prerequisiteTitles.length > 0
                ? labels.lockedHint.replace(
                    "{courses}",
                    item.prerequisiteTitles.join(", ")
                  )
                : undefined
            }
          >
            <IconLock aria-hidden className="size-3.5" />
            {labels.lockedBadge}
          </span>
        )}

        {isCompleted && item.hasCertificate && (
          <span
            aria-label={labels.certificateAria}
            className="absolute top-3 right-3 flex items-center justify-center rounded-button border-2 border-border-strong bg-surface-card p-2 shadow-hard-xs"
          >
            <IconAward aria-hidden className="size-4 text-academy-yellow" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-stack p-card-sm">
        <div className="space-y-1">
          <h3 className="line-clamp-2 leading-tight font-bold tracking-tight-brand">
            {item.title}
          </h3>
          {item.instructors.length > 0 && (
            <p className="line-clamp-1 text-label text-content-muted">
              {item.instructors.join(", ")}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-stack">
          {isStarted ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-content-muted">
                  {labels.progressLabel}
                </p>
                <p className="text-sm font-bold tabular-nums">{progress}%</p>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={labels.progressLabel}
                className="h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted"
              >
                <div
                  className="h-full bg-academy-yellow transition-[width] duration-300 ease-academy"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center rounded-button border-2 border-border-strong bg-academy-yellow p-1.5">
                <IconClock aria-hidden className="size-4" />
              </span>
              <p className="text-sm font-bold text-content-muted">
                {labels.durationLabel.replace(
                  "{duration}",
                  formatDuration(item.durationMinutes)
                )}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center justify-between rounded-button border-2 border-border-strong bg-academy-green-soft p-3">
              <span className="text-sm font-bold">
                {labels.completedNotice}
              </span>
              <IconCircleCheck
                aria-hidden
                className="size-5 text-academy-green"
              />
            </div>
          )}

          {isUnlocked && !isStarted && onStart ? (
            // Record progress first; the action redirects into the course.
            <button
              type="button"
              disabled={isStarting}
              onClick={() => onStart(item.courseId, item.href)}
              className={ctaClasses}
            >
              {cta}
            </button>
          ) : isUnlocked ? (
            <Link to={item.href} className={ctaClasses}>
              {cta}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-button border-2 border-border-strong bg-surface-muted px-4 py-2.5 font-bold tracking-tight-brand text-content-muted opacity-70"
            >
              {cta}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function StudentCourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-sm">
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex flex-col gap-stack p-card-sm">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2.5 w-full rounded-pill" />
        <Skeleton className="h-10 w-full rounded-button" />
      </div>
    </div>
  )
}
