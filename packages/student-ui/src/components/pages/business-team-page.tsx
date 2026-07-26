import { cn } from "@academy/user-ui/lib/utils"
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconUsersGroup,
} from "@tabler/icons-react"
import { Link } from "react-router"

export interface BusinessTeamMemberRow {
  id: string
  fullName: string
  email: string
  role: string | null
  occupation: string | null
  profilePicture: string | null
  isActive: boolean
  coursesInProgress: number
  coursesCompleted: number
  certificatesEarned: number
  avgProgress: number
  lastActivityAt: string | null
}

export interface StudentBusinessTeamPageProps {
  members: BusinessTeamMemberRow[]
  total: number
  /** 1-based. */
  page: number
  pageSize: number
  query: string
  currentUserId?: string | null
  /** Lang-scoped route, e.g. "/es/dashboard/team", for search + pagination links. */
  basePath: string
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

/**
 * "Mi Equipo" — the full company roster with server-side search and pagination.
 * Company-admin only (the route guards it).
 */
export function StudentBusinessTeamPage({
  members,
  total,
  page,
  pageSize,
  query,
  currentUserId,
  basePath,
}: StudentBusinessTeamPageProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const hrefFor = (p: number) =>
    `${basePath}?q=${encodeURIComponent(query)}&page=${p}`

  return (
    <div className="flex flex-col gap-stack-lg">
      <header className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
        <div className="flex items-center gap-stack">
          <span className="rounded-button border-2 border-border-strong bg-academy-blue p-2">
            <IconUsersGroup aria-hidden className="size-8" />
          </span>
          <div>
            <h1 className="text-section-title leading-display font-bold tracking-display">
              Mi Equipo
            </h1>
            <p className="text-sm text-content-muted">
              {total} {total === 1 ? "miembro" : "miembros"} en tu empresa
            </p>
          </div>
        </div>
      </header>

      <form method="get" action={basePath} className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch
            aria-hidden
            className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-content-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o correo…"
            aria-label="Buscar miembros"
            className="w-full rounded-button border-2 border-border-strong bg-surface-card py-2.5 pr-4 pl-12 font-bold shadow-hard-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          />
        </div>
        <button
          type="submit"
          className="rounded-button border-2 border-border-strong bg-academy-yellow px-5 py-2.5 font-bold shadow-hard-sm transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          Buscar
        </button>
      </form>

      {members.length === 0 ? (
        <div className="rounded-card-lg border-2 border-border-strong bg-surface-card p-12 text-center shadow-hard-lg">
          <p className="font-bold">
            {query
              ? "Ningún miembro coincide con tu búsqueda."
              : "Aún no hay miembros en tu equipo."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-stack">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-stack rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-sm"
            >
              <Avatar name={member.fullName} src={member.profilePicture} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold">
                  <span className="truncate">{member.fullName}</span>
                  {member.id === currentUserId && (
                    <span className="shrink-0 rounded-pill border-2 border-border-strong bg-academy-yellow px-2 py-0.5 text-label font-bold">
                      Tú
                    </span>
                  )}
                  {!member.isActive && (
                    <span className="shrink-0 rounded-pill border-2 border-border-strong bg-surface-muted px-2 py-0.5 text-label font-bold text-content-muted">
                      Inactivo
                    </span>
                  )}
                </p>
                <p className="truncate text-label text-content-muted">
                  {member.email}
                  {member.occupation ? ` · ${member.occupation}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip label="En progreso" value={member.coursesInProgress} />
                <Chip label="Completados" value={member.coursesCompleted} />
                <Chip label="Certificados" value={member.certificatesEarned} />
              </div>

              <div className="w-32 shrink-0">
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
                <p className="mt-1 text-label text-content-muted">
                  Últ. actividad: {formatDate(member.lastActivityAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-content-muted">
            {from}–{to} de {total}
          </p>
          <div className="flex items-center gap-2">
            <PageLink
              href={hrefFor(page - 1)}
              disabled={page <= 1}
              direction="prev"
            />
            <span className="text-sm font-bold tabular-nums">
              {page} / {pageCount}
            </span>
            <PageLink
              href={hrefFor(page + 1)}
              disabled={page >= pageCount}
              direction="next"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-button border-2 border-border-strong bg-surface-page px-3 py-1.5 text-label font-bold">
      {label}: <span className="tabular-nums">{value}</span>
    </span>
  )
}

function PageLink({
  href,
  disabled,
  direction,
}: {
  href: string
  disabled: boolean
  direction: "prev" | "next"
}) {
  const Icon = direction === "prev" ? IconChevronLeft : IconChevronRight
  const base =
    "inline-flex size-9 items-center justify-center rounded-button border-2 border-border-strong shadow-hard-xs"
  if (disabled) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-not-allowed bg-surface-muted opacity-50")}
      >
        <Icon aria-hidden className="size-4" />
      </span>
    )
  }
  return (
    <Link
      to={href}
      aria-label={direction === "prev" ? "Anterior" : "Siguiente"}
      className={cn(
        base,
        "bg-surface-card transition-all duration-150 ease-academy hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
      )}
    >
      <Icon aria-hidden className="size-4" />
    </Link>
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
        initials || "?"
      )}
    </span>
  )
}
