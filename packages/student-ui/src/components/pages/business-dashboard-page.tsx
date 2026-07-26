import { cn } from "@academy/user-ui/lib/utils"
import {
  IconAward,
  IconCircleCheck,
  IconClock,
  IconTrendingUp,
  IconUserCheck,
  IconUsersGroup,
} from "@tabler/icons-react"

export interface BusinessTeamMember {
  id: string
  fullName: string
  email: string
  profilePicture: string | null
  coursesInProgress: number
  coursesCompleted: number
  avgProgress: number
}

export interface BusinessDashboardStats {
  totalMembers: number
  activeMembers: number
  coursesInProgress: number
  coursesCompleted: number
  certificatesEarned: number
  avgProgressPercentage: number
}

export interface BusinessDashboardView {
  companyName: string
  stats: BusinessDashboardStats
  teamPreview: BusinessTeamMember[]
  teamTotal: number
}

export interface StudentBusinessDashboardProps {
  data: BusinessDashboardView
  /** Greeting name (the admin's first name), when available. */
  firstName?: string | null
  /** The logged-in user's id — their row in the roster gets a "you" badge. */
  currentUserId?: string | null
}

/**
 * Company-admin landing: team-wide stats and a short roster preview. The full
 * team table and reports are separate surfaces (not built yet) — this is the
 * overview a business owner sees instead of the learner dashboard.
 */
export function StudentBusinessDashboard({
  data,
  firstName,
  currentUserId,
}: StudentBusinessDashboardProps) {
  const { companyName, stats, teamPreview, teamTotal } = data

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <span className="inline-flex items-center gap-2 rounded-pill border-2 border-border-strong bg-academy-blue px-3 py-1 text-label font-bold text-content-inverse">
          <IconUsersGroup aria-hidden className="size-4" />
          Business
        </span>
        <h1 className="mt-2 text-section-title leading-display font-bold tracking-display">
          Hola{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-content-muted">
          Resumen de <span className="font-bold">{companyName}</span> ·{" "}
          {teamTotal} {teamTotal === 1 ? "miembro" : "miembros"} en tu equipo.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <StatTile icon={IconUsersGroup} tone="bg-academy-blue" label="Miembros" value={stats.totalMembers} />
        <StatTile icon={IconUserCheck} tone="bg-academy-green" label="Activos" value={stats.activeMembers} />
        <StatTile icon={IconClock} tone="bg-academy-yellow" label="En progreso" value={stats.coursesInProgress} />
        <StatTile icon={IconCircleCheck} tone="bg-academy-green" label="Completados" value={stats.coursesCompleted} />
        <StatTile icon={IconAward} tone="bg-academy-coral" label="Certificados" value={stats.certificatesEarned} />
        <StatTile
          icon={IconTrendingUp}
          tone="bg-academy-blue"
          label="Progreso prom."
          value={`${Math.round(stats.avgProgressPercentage)}%`}
        />
      </div>

      <section className="rounded-card border-2 border-border-strong bg-surface-card shadow-hard-md">
        <div className="flex items-center justify-between border-b-2 border-border-strong p-card">
          <h2 className="text-card-title font-bold tracking-tight-brand">
            Tu equipo
          </h2>
          <span className="text-label font-bold text-content-muted">
            {teamTotal} {teamTotal === 1 ? "miembro" : "miembros"}
          </span>
        </div>

        {teamPreview.length === 0 ? (
          <p className="p-card text-content-muted">
            Aún no hay miembros en tu equipo.
          </p>
        ) : (
          <ul className="divide-y-2 divide-border-subtle">
            {teamPreview.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 p-card"
              >
                <Avatar name={member.fullName} src={member.profilePicture} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-bold">
                    <span className="truncate">{member.fullName}</span>
                    {member.id === currentUserId && (
                      <span className="shrink-0 rounded-pill border-2 border-border-strong bg-academy-yellow px-2 py-0.5 text-label font-bold">
                        Tú
                      </span>
                    )}
                  </p>
                  <p className="truncate text-label text-content-muted">
                    {member.email}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-label font-bold text-content-muted">
                    Completados
                  </p>
                  <p className="font-bold tabular-nums">
                    {member.coursesCompleted}
                  </p>
                </div>
                <div className="w-28 shrink-0">
                  <div className="flex items-center justify-between text-label font-bold">
                    <span className="text-content-muted">Progreso</span>
                    <span className="tabular-nums">
                      {Math.round(member.avgProgress)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-pill border-2 border-border-strong bg-surface-muted">
                    <div
                      className="h-full bg-academy-green"
                      style={{
                        width: `${Math.min(Math.max(member.avgProgress, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border-strong bg-academy-yellow text-sm font-bold">
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        (initials || "?")
      )}
    </span>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof IconAward
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
