import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@academy/user-ui/components/ui/sidebar"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconDownload,
  IconFile,
  IconVideoOff,
} from "@tabler/icons-react"
import { Link } from "react-router"
import type {
  CourseOutline,
  CourseViewerLabels,
  LessonView,
} from "../../types/course-viewer"
import { CourseSidebar } from "../course/course-sidebar"
import { VideoPlayer } from "../course/video-player"
import { RichHtml } from "../rich-html"

export interface StudentLessonPageProps {
  outline: CourseOutline
  lesson: LessonView
  labels: CourseViewerLabels
  coursesHref: string
  /** Neighbours in the flattened order; null at the ends. */
  previousHref: string | null
  nextHref: string | null
  isSavingCompletion?: boolean
  onToggleComplete: () => void
  /** Called when the video reaches the end. */
  onVideoEnded?: () => void
  /** Practice-bites widget, rendered below the materials. Wired by the route. */
  practiceBites?: React.ReactNode
  /** Certificates-page link, present once the course is completed. */
  certificateHref?: string | null
}

/**
 * Lesson viewer: contents sidebar, video, lesson body, materials, and the
 * prev/next + complete controls.
 *
 * Everything it needs is resolved by the route, so this renders the same on the
 * server as the client — the old viewer fetched the course client-side and
 * flashed an empty sidebar and a lone spinner on every hard refresh.
 */
export function StudentLessonPage({
  outline,
  lesson,
  labels,
  coursesHref,
  previousHref,
  nextHref,
  isSavingCompletion,
  onToggleComplete,
  onVideoEnded,
  practiceBites,
  certificateHref,
}: StudentLessonPageProps) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <CourseSidebar
        outline={outline}
        activeItemId={lesson.id}
        labels={labels}
        coursesHref={coursesHref}
        certificateHref={certificateHref}
      />

      <SidebarInset className="min-w-0 bg-surface-page">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-border-strong bg-surface-card px-4 py-3">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">
            <p className="text-label font-bold text-content-muted uppercase">
              {labels.lessonLabel}
            </p>
            <h1 className="truncate font-bold tracking-tight-brand">
              {lesson.title}
            </h1>
          </div>
          {lesson.completed && (
            <span className="hidden shrink-0 items-center gap-2 rounded-pill border-2 border-border-strong bg-academy-green px-3 py-1 text-sm font-bold sm:inline-flex">
              <IconCircleCheck aria-hidden className="size-4" />
              {labels.completedBadge}
            </span>
          )}
        </header>

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-stack-lg p-4 md:p-card">
          {lesson.video ? (
            <VideoPlayer
              // Remount per lesson so playback state never carries over.
              key={lesson.id}
              src={lesson.video.src}
              format={lesson.video.format}
              duration={lesson.video.durationSeconds}
              labels={labels.video}
              onEnded={onVideoEnded}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-card border-2 border-dashed border-border-subtle p-12 text-center text-content-muted">
              <IconVideoOff aria-hidden className="size-8" />
              <p className="font-bold">{labels.noVideo}</p>
            </div>
          )}

          <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
            <h2 className="mb-stack text-card-title font-bold tracking-tight-brand">
              {lesson.title}
            </h2>
            {lesson.content ? (
              // Sanitized in the loader; memoized so an embedded video isn't
              // reset by unrelated re-renders.
              <RichHtml html={lesson.content} />
            ) : (
              <p className="text-content-muted">{labels.noContent}</p>
            )}
          </section>

          <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-md">
            <h2 className="mb-stack text-card-title font-bold tracking-tight-brand">
              {labels.attachmentsTitle}
            </h2>
            {lesson.attachments.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {lesson.attachments.map((attachment) => (
                  <li key={attachment.url}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex items-center gap-3 rounded-card border-2 border-border-strong bg-surface-page p-3 font-bold transition-all duration-150 ease-academy hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                    >
                      <IconFile aria-hidden className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {attachment.filename}
                      </span>
                      <IconDownload
                        aria-hidden
                        className="size-4 shrink-0 text-content-muted"
                      />
                      <span className="sr-only">{labels.downloadCta}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-content-muted">{labels.attachmentsEmpty}</p>
            )}
          </section>

          {/* Practice bites sit below the materials, per the old viewer. */}
          {practiceBites}

          <nav className="flex flex-wrap items-center justify-between gap-stack">
            <NavButton href={previousHref} label={labels.previous} direction="prev" />

            <button
              type="button"
              onClick={onToggleComplete}
              disabled={isSavingCompletion}
              aria-pressed={lesson.completed}
              className={cn(
                "inline-flex items-center gap-2 rounded-button border-2 border-border-strong px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:pointer-events-none disabled:opacity-60",
                lesson.completed ? "bg-academy-green" : "bg-surface-card"
              )}
            >
              <IconCircleCheck aria-hidden className="size-4" />
              {isSavingCompletion
                ? labels.savingComplete
                : lesson.completed
                  ? labels.markedComplete
                  : labels.markComplete}
            </button>

            <NavButton href={nextHref} label={labels.next} direction="next" />
          </nav>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Renders as a link, or a disabled-looking span at the ends of the course. */
function NavButton({
  href,
  label,
  direction,
}: {
  href: string | null
  label: string
  direction: "prev" | "next"
}) {
  const Icon = direction === "prev" ? IconChevronLeft : IconChevronRight
  const content = (
    <>
      {direction === "prev" && <Icon aria-hidden className="size-4" />}
      {label}
      {direction === "next" && <Icon aria-hidden className="size-4" />}
    </>
  )

  const base =
    "inline-flex items-center gap-2 rounded-button border-2 border-border-strong px-4 py-2 font-bold shadow-hard-xs"

  if (!href) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-not-allowed bg-surface-muted opacity-50")}
      >
        {content}
      </span>
    )
  }

  return (
    <Link
      to={href}
      className={cn(
        base,
        "bg-surface-card transition-all duration-150 ease-academy hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
      )}
    >
      {content}
    </Link>
  )
}
