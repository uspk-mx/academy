import { cn } from "@academy/user-ui/lib/utils"
import {
  IconBook,
  IconChartBar,
  IconCircleCheck,
  IconUsersGroup,
} from "@tabler/icons-react"

export interface CourseProgressReport {
  id: string
  title: string
  image: string | null
  enrolled: number
  started: number
  completed: number
  avgProgress: number
}

export interface StudentBusinessReportsPageProps {
  courses: CourseProgressReport[]
}

function rate(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

/**
 * "Reportes" — per-course progress across the whole team, from
 * `companyCourseProgressSummary`. Company-admin only (the route guards it).
 */
export function StudentBusinessReportsPage({
  courses,
}: StudentBusinessReportsPageProps) {
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0)
  const totalCompleted = courses.reduce((sum, c) => sum + c.completed, 0)

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-coral p-2">
            <IconChartBar aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              Reportes
            </h1>
            <p className="text-sm text-content-muted">
              Progreso de tu equipo por curso
            </p>
          </div>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
          <p className="font-bold">Aún no hay cursos con actividad del equipo.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile icon={IconBook} tone="bg-academy-blue" label="Cursos" value={courses.length} />
            <StatTile icon={IconUsersGroup} tone="bg-academy-yellow" label="Inscripciones" value={totalEnrolled} />
            <StatTile icon={IconCircleCheck} tone="bg-academy-green" label="Completados" value={totalCompleted} />
            <StatTile
              icon={IconChartBar}
              tone="bg-academy-coral"
              label="Finalización"
              value={`${rate(totalCompleted, totalEnrolled)}%`}
            />
          </div>

          <ul className="flex flex-col gap-stack">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-wrap items-center gap-stack rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-sm"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-button border-2 border-border-strong bg-surface-muted">
                  {course.image && (
                    <img
                      src={course.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold tracking-tight-brand">
                    {course.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Chip label="Inscritos" value={course.enrolled} />
                    <Chip label="Iniciados" value={course.started} />
                    <Chip label="Completados" value={course.completed} />
                  </div>
                </div>

                <div className="w-40 shrink-0">
                  <div className="flex items-center justify-between text-label font-bold">
                    <span className="text-content-muted">Progreso prom.</span>
                    <span className="tabular-nums">
                      {Math.round(course.avgProgress)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted">
                    <div
                      className="h-full bg-academy-green"
                      style={{
                        width: `${Math.min(Math.max(course.avgProgress, 0), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-label font-bold text-content-muted">
                    Finalización: {rate(course.completed, course.enrolled)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-button border-2 border-border-strong bg-surface-page px-3 py-1 text-label font-bold">
      {label}: <span className="tabular-nums">{value}</span>
    </span>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconBook
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
