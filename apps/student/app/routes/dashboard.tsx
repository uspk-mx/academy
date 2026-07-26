import { getCompanyDashboard } from "@academy/courses-api/graphql/student-app/queries/company"
import { getUserProfile } from "@academy/courses-api/graphql/student-app/queries/users"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import {
  StudentBusinessDashboard,
  type BusinessDashboardView,
} from "@academy/student-ui/components/pages/business-dashboard-page"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAward,
  IconBook,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconHelpCircle,
  IconPlayerPlay,
  IconStar,
  IconTarget,
} from "@tabler/icons-react"
import { Link, useParams } from "react-router"
import { getCourseUrl } from "../../lib/course-utils"
import type { Route } from "./+types/dashboard"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Inicio" },
    { name: "description", content: "Tu panel de aprendizaje en Uspk Academy." },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const me = await getMe(request)
  const user = me?.me
  if (!user) throw new Response("Not Found", { status: 404 })

  const firstName = user.fullName?.trim().split(" ")[0] || null
  const companyId = user.company?.id

  // Company admins get the team overview instead of the learner dashboard.
  if (user.role === "business" && companyId) {
    const dash = await getCompanyDashboard(request, companyId)
    const stats = dash?.companyTeamStats
    const team = dash?.companyTeamMembers

    const business: BusinessDashboardView = {
      companyName: user.company?.name || "Tu empresa",
      stats: {
        totalMembers: stats?.totalMembers ?? 0,
        activeMembers: stats?.activeMembers ?? 0,
        coursesInProgress: stats?.coursesInProgress ?? 0,
        coursesCompleted: stats?.coursesCompleted ?? 0,
        certificatesEarned: stats?.certificatesEarned ?? 0,
        avgProgressPercentage: stats?.avgProgressPercentage ?? 0,
      },
      teamTotal: team?.total ?? 0,
      teamPreview: (team?.members ?? []).map((member) => ({
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        profilePicture: member.profilePicture ?? null,
        coursesInProgress: member.coursesInProgress,
        coursesCompleted: member.coursesCompleted,
        avgProgress: member.avgProgress,
      })),
    }

    return {
      kind: "business" as const,
      business,
      firstName,
      // customerId is the user's id (matches team-member ids) — badges "you".
      currentUserId: user.customerId,
    }
  }

  const profile = await getUserProfile(request)
  if (!profile?.getProfile) {
    throw new Response("Not Found", { status: 404 })
  }

  return { kind: "student" as const, profile: profile.getProfile }
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { lang = "es" } = useParams()

  if (loaderData.kind === "business") {
    return (
      <StudentBusinessDashboard
        data={loaderData.business}
        firstName={loaderData.firstName}
        currentUserId={loaderData.currentUserId}
      />
    )
  }

  const { profile } = loaderData
  const coursesHref = `/${lang}/dashboard/courses`

  const courses = profile.courses ?? []

  const stats = {
    enrolled: courses.length,
    active: courses.filter((item) => item?.progress?.startedAt).length,
    completed: courses.filter((item) => item?.progress?.completed).length,
    lessonsCompleted: courses.flatMap(
      (course) =>
        course?.topics?.flatMap(
          (topic) =>
            topic?.lessons?.filter((lesson) => lesson?.progress?.completed) ?? []
        ) ?? []
    ).length,
    quizzesCompleted: courses.flatMap(
      (course) =>
        course?.topics?.flatMap(
          (topic) =>
            topic?.quizzes?.filter((quiz) => quiz?.progress?.completed) ?? []
        ) ?? []
    ).length,
    // Summed across every course, not just the first one.
    certificates: courses.reduce(
      (sum, course) => sum + (course?.certificates?.length ?? 0),
      0
    ),
  }

  const inProgressCourses = courses
    .filter(
      (item) =>
        item?.progress?.startedAt &&
        new Date(item.progress.startedAt) <= new Date() &&
        !item.progress.completed
    )
    .sort(
      (a, b) =>
        new Date(b?.progress?.startedAt || 0).getTime() -
        new Date(a?.progress?.startedAt || 0).getTime()
    )

  const lastCourse = inProgressCourses[0]
  const isNewUser = stats.enrolled === 0
  // No hardcoded fallback name — greet by first name only when we have one.
  const firstName = profile.fullName?.trim().split(" ")[0]

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <h1 className="text-section-title leading-display font-bold tracking-display">
          Hola{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-content-muted">
          {isNewUser
            ? "¡Bienvenido! Comienza tu viaje de aprendizaje."
            : stats.active > 0
              ? `Tienes ${stats.active} ${stats.active === 1 ? "curso activo" : "cursos activos"}. ¡Sigue así!`
              : "¿Listo para continuar aprendiendo?"}
        </p>
      </header>

      {lastCourse ? (
        <Link
          to={getCourseUrl({ course: lastCourse }, lang)}
          className="group block rounded-card border-2 border-border-strong bg-academy-yellow p-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          <div className="flex flex-col gap-stack md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-stack">
              <div className="size-20 shrink-0 overflow-hidden rounded-card border-2 border-border-strong bg-surface-card">
                {lastCourse.featuredImage && (
                  <img
                    src={lastCourse.featuredImage}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-pill border-2 border-border-strong bg-surface-card px-3 py-1 text-label font-bold">
                  <IconClock aria-hidden className="size-3" />
                  En progreso
                </span>
                <h2 className="mt-2 text-card-title font-bold tracking-tight-brand">
                  {lastCourse.title || "Curso sin título"}
                </h2>
                <p className="line-clamp-2 text-sm text-content-muted">
                  {lastCourse.shortDescription || ""}
                </p>
                {lastCourse.progress?.progressPercentage != null && (
                  <ProgressBar value={lastCourse.progress.progressPercentage} />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end font-bold md:flex-col md:items-end md:self-center">
              <span>Continuar</span>
              <IconPlayerPlay
                aria-hidden
                className="size-7 transition-transform duration-150 ease-academy group-hover:translate-x-0.5"
              />
            </div>
          </div>
        </Link>
      ) : (
        <Link
          to={coursesHref}
          className="group block rounded-card border-2 border-border-strong bg-academy-yellow p-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          <div className="flex flex-col items-start justify-between gap-stack md:flex-row md:items-center">
            <div>
              <h2 className="text-card-title font-bold tracking-tight-brand">
                {isNewUser ? "Aún no tienes cursos" : "Ve a tus cursos"}
              </h2>
              <p className="text-sm text-content-muted">
                {isNewUser
                  ? "Cuando te inscribas a un curso aparecerá aquí."
                  : "Continúa tu aprendizaje cuando quieras."}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end font-bold md:self-center">
              <span>Mis cursos</span>
              <IconChevronRight
                aria-hidden
                className="size-6 transition-transform duration-150 ease-academy group-hover:translate-x-0.5"
              />
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <StatTile icon={IconBook} tone="bg-academy-blue" label="Inscritos" value={stats.enrolled} />
        <StatTile icon={IconClock} tone="bg-academy-yellow" label="Activos" value={stats.active} />
        <StatTile icon={IconCircleCheck} tone="bg-academy-green" label="Completados" value={stats.completed} />
        <StatTile icon={IconTarget} tone="bg-academy-coral" label="Lecciones" value={stats.lessonsCompleted} />
        <StatTile icon={IconHelpCircle} tone="bg-academy-blue" label="Quizzes" value={stats.quizzesCompleted} />
        <StatTile icon={IconAward} tone="bg-academy-green" label="Certificados" value={stats.certificates} />
      </div>

      {inProgressCourses.length > 1 && (
        <section className="flex flex-col gap-stack">
          <div className="flex items-center justify-between">
            <h2 className="text-card-title font-bold tracking-tight-brand">
              Continúa donde lo dejaste
            </h2>
            <Link
              to={coursesHref}
              className="group inline-flex items-center gap-1.5 text-sm font-bold hover:text-academy-blue"
            >
              Ver todos
              <IconChevronRight
                aria-hidden
                className="size-4 transition-transform duration-150 ease-academy group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <div className="grid gap-stack sm:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.slice(1, 4).map((course) => (
              <Link
                key={course?.id}
                to={getCourseUrl({ course: course as NonNullable<typeof course> }, lang)}
                className="group overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
              >
                <div className="aspect-video overflow-hidden border-b-2 border-border-strong bg-surface-muted">
                  {course?.featuredImage && (
                    <img
                      src={course.featuredImage}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-stack p-card">
                  <h3 className="line-clamp-2 font-bold tracking-tight-brand">
                    {course?.title || "Curso sin título"}
                  </h3>
                  {course?.progress?.progressPercentage != null && (
                    <ProgressBar value={course.progress.progressPercentage} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isNewUser && (
        <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
          <div className="mx-auto flex max-w-md flex-col items-center gap-stack">
            <span className="flex size-16 items-center justify-center rounded-card border-2 border-border-strong bg-academy-yellow">
              <IconStar aria-hidden className="size-8" />
            </span>
            <h2 className="text-card-title font-bold tracking-tight-brand">
              ¡Comienza tu viaje de aprendizaje!
            </h2>
            <p className="text-content-muted">
              Tus cursos aparecerán aquí en cuanto te inscribas.
            </p>
            <Link
              to={coursesHref}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-6 py-3 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            >
              Ir a mis cursos
              <IconChevronRight aria-hidden className="size-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(Math.round(value), 0), 100)
  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-label font-bold">
        <span className="text-content-muted">Progreso</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        role="img"
        aria-label={`${pct}%`}
        className="h-2.5 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-card"
      >
        <div
          className="h-full bg-academy-ink transition-[width] duration-300 ease-academy"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
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
  value: number
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
