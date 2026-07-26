import { Badge } from "@academy/user-ui/components/ui/badge"
import { Skeleton } from "@academy/user-ui/components/ui/skeleton"
import { cn } from "@academy/user-ui/lib/utils"
import { IconMoodSmile } from "@tabler/icons-react"
import { Link, useLocation, useParams } from "react-router"
import { getStudentNavItems, type StudentNavItem } from "../lib/nav-items"
import type { StudentLayoutLabels, StudentUser } from "../types/layout"

export interface StudentSidebarProps {
  user: StudentUser | null
  labels: StudentLayoutLabels
  isBusinessUser?: boolean
  isLoading?: boolean
  onLogout: () => void
  className?: string
}

/** Desktop-only rail: profile card + primary navigation. */
export const StudentSidebar = ({
  user,
  labels,
  isBusinessUser = false,
  isLoading,
  onLogout,
  className,
}: StudentSidebarProps) => {
  const { pathname } = useLocation()
  const { lang = "es" } = useParams()

  const items = getStudentNavItems({
    lang,
    pathname,
    isBusinessUser,
    labels,
  }).filter((item) => item.showInSidebar)

  return (
    <aside
      className={cn(
        "hidden max-h-fit rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg md:block",
        className
      )}
    >
      <div className="mb-stack-lg text-center">
        <div className="relative mx-auto mb-stack size-32">
          {/* Offset plate behind the avatar — the brand's stacked-card look. */}
          <div
            aria-hidden
            className="absolute inset-0 rotate-3 rounded-card border-2 border-border-strong bg-academy-coral"
          />
          {isLoading ? (
            <Skeleton className="relative size-32 rounded-card" />
          ) : user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              width={128}
              height={128}
              className="relative size-full max-h-32 rounded-card border-2 border-border-strong object-cover"
            />
          ) : (
            <div className="relative flex h-full items-center justify-center">
              <IconMoodSmile
                aria-hidden
                className="h-full max-h-32 w-4/6 text-academy-yellow"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <>
            <Skeleton className="mx-auto mt-2 h-6 w-40" />
            <Skeleton className="mx-auto mt-2 h-4 w-24" />
          </>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="mt-2 text-card-title font-bold tracking-tight-brand">
              {user?.fullName}
            </h2>
            {user?.userName && (
              <span className="text-sm text-content-muted">
                @{user.userName}
              </span>
            )}
            {isBusinessUser && (
              <Badge className="mt-2 border-2 border-border-strong bg-academy-blue text-content-inverse">
                {labels.header.businessAccountBadge}
              </Badge>
            )}
          </div>
        )}
      </div>

      <nav className="space-y-2">
        {items.map((item) =>
          item.isLogout ? (
            <SidebarAction key={item.id} item={item} onClick={onLogout} />
          ) : (
            <SidebarLink key={item.id} item={item} />
          )
        )}
      </nav>
    </aside>
  )
}

const itemClasses = (active: boolean) =>
  cn(
    "group flex w-full items-center gap-3 rounded-button border-2 border-border-strong px-4 py-2.5 font-bold transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
    active
      ? "bg-academy-ink text-content-inverse"
      : "bg-surface-card hover:bg-academy-yellow"
  )

function SidebarLink({ item }: { item: StudentNavItem }) {
  return (
    <Link to={item.href ?? "#"} className={itemClasses(item.active)}>
      <item.icon aria-hidden className="size-5 shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && (
        <Badge className="border-2 border-border-strong bg-academy-yellow text-content-primary">
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

function SidebarAction({
  item,
  onClick,
}: {
  item: StudentNavItem
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={itemClasses(false)}>
      <item.icon aria-hidden className="size-5 shrink-0" />
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  )
}
