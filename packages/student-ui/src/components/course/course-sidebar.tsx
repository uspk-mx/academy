import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@academy/user-ui/components/ui/sidebar"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
  IconHelpCircle,
  IconPlayerPlay,
  IconTrophy,
} from "@tabler/icons-react"
import { Link } from "react-router"
import type { CourseOutline, CourseViewerLabels } from "../../types/course-viewer"

export interface CourseSidebarProps {
  outline: CourseOutline
  /** Item currently open, so it can be marked active. */
  activeItemId: string
  labels: CourseViewerLabels
  coursesHref: string
  /**
   * Link to the certificates page, present once the course is completed. The
   * viewer only announces the certificate; the certificates page owns the heavy
   * PDF generation, so nothing pulls the renderer onto this hot path.
   */
  certificateHref?: string | null
}

/**
 * Course contents. Uses the shadcn sidebar shell for the collapse/mobile
 * behaviour and styles the contents with the academy tokens.
 */
export function CourseSidebar({
  outline,
  activeItemId,
  labels,
  coursesHref,
  certificateHref,
}: CourseSidebarProps) {
  return (
    <Sidebar className="border-r-2 border-border-strong">
      <SidebarHeader className="gap-stack border-b-2 border-border-strong bg-surface-card p-4">
        <Link
          to={coursesHref}
          className="inline-flex items-center gap-2 text-label font-bold text-content-muted hover:text-content-primary"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          {labels.backToCourses}
        </Link>

        <div>
          <h2 className="line-clamp-2 font-bold tracking-tight-brand">
            {outline.courseTitle}
          </h2>
          <p className="mt-1 text-label font-bold text-content-muted">
            {labels.progressSummary
              .replace("{done}", String(outline.completedCount))
              .replace("{total}", String(outline.totalCount))}
          </p>
        </div>

        <div
          role="img"
          aria-label={`${outline.progressPercentage}%`}
          className="h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted"
        >
          <div
            className="h-full bg-academy-green transition-[width] duration-300 ease-academy"
            style={{ width: `${outline.progressPercentage}%` }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-surface-card">
        {outline.topics.map((topic) => {
          const done = topic.items.filter((item) => item.completed).length
          return (
            <SidebarGroup key={topic.id}>
              <SidebarGroupLabel className="flex items-center justify-between font-bold text-content-primary">
                <span className="truncate">{topic.title}</span>
                <span className="shrink-0 text-label text-content-muted tabular-nums">
                  {done}/{topic.items.length}
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {topic.items.map((item) => {
                    const isActive = item.id === activeItemId
                    const Icon =
                      item.kind === "quiz" ? IconHelpCircle : IconPlayerPlay
                    return (
                      <SidebarMenuItem key={`${item.kind}-${item.id}`}>
                        <SidebarMenuButton
                          isActive={isActive}
                          className={cn(
                            "h-auto items-start gap-2 rounded-button border-2 border-transparent py-2 font-bold whitespace-normal",
                            isActive &&
                              "border-border-strong bg-academy-yellow shadow-hard-xs hover:bg-academy-yellow"
                          )}
                          render={<Link to={item.href} />}
                        >
                          {item.completed ? (
                            <IconCircleCheckFilled
                              aria-hidden
                              className="mt-0.5 size-4 shrink-0 text-academy-green"
                            />
                          ) : (
                            <Icon
                              aria-hidden
                              className="mt-0.5 size-4 shrink-0 text-content-muted"
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm leading-snug">
                              {item.title}
                            </span>
                            <span className="block text-label font-bold text-content-muted">
                              {item.kind === "quiz"
                                ? labels.quizLabel
                                : labels.lessonLabel}
                            </span>
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-border-strong bg-surface-card p-4">
        {certificateHref ? (
          <Link
            to={certificateHref}
            className="group flex items-center gap-3 rounded-card border-2 border-border-strong bg-academy-green-soft p-3 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-button border-2 border-border-strong bg-academy-yellow">
              <IconTrophy aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">
                {labels.certificateReady}
              </span>
              <span className="block text-label text-content-muted">
                {labels.viewCertificate}
              </span>
            </span>
            <IconArrowRight
              aria-hidden
              className="size-4 shrink-0 transition-transform duration-150 ease-academy group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <p className="text-label font-bold text-content-muted">
            {labels.contentsTitle}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
