import { Badge } from "@academy/user-ui/components/ui/badge"
import { Button } from "@academy/user-ui/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@academy/user-ui/components/ui/drawer"
import { cn } from "@academy/user-ui/lib/utils"
import { IconMenu2, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import {
  getPrimaryMobileNavItems,
  getStudentNavItems,
  type StudentNavItem,
} from "../lib/nav-items"
import type { StudentLayoutLabels, StudentUser } from "../types/layout"

export interface StudentMobileNavProps {
  user?: StudentUser | null
  labels: StudentLayoutLabels
  isBusinessUser?: boolean
  onLogout: () => void
}

/** Fixed bottom bar (mobile only): 3 primary destinations + a full menu drawer. */
export const StudentMobileNav = ({
  labels,
  isBusinessUser = false,
  onLogout,
}: StudentMobileNavProps) => {
  const { pathname } = useLocation()
  const { lang = "es" } = useParams()
  const [open, setOpen] = useState(false)

  const navArgs = { lang, pathname, isBusinessUser, labels }
  const primaryItems = getPrimaryMobileNavItems(navArgs)
  const menuItems = getStudentNavItems(navArgs)

  const closeMenu = () => setOpen(false)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border-strong bg-surface-card block md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around p-2">
        {primaryItems.map((item) => (
          <Link
            key={item.id}
            to={item.href ?? "#"}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
              item.active ? "text-content-primary" : "text-content-muted"
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-6", item.active && "text-academy-blue")}
            />
            <span className="text-label font-bold">{item.label}</span>
          </Link>
        ))}

        <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
          <DrawerTrigger
            render={
              <button
                type="button"
                className="flex flex-col items-center gap-1 px-3 py-2 text-content-muted"
              >
                <>
                  <IconMenu2 aria-hidden className="size-6" />
                  <span className="text-label font-bold">
                    {labels.mobile.menuLabel}
                  </span>
                </>
              </button>
            }
          />
          <DrawerContent>
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle className="text-card-title font-bold tracking-tight-brand">
                {labels.mobile.menuTitle}
              </DrawerTitle>
              <DrawerClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={labels.mobile.closeMenuAria}
                  >
                    <IconX aria-hidden />
                  </Button>
                }
              />
            </DrawerHeader>
            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
              {menuItems.map((item) =>
                item.isLogout ? (
                  <MenuAction
                    key={item.id}
                    item={item}
                    onClick={() => {
                      closeMenu()
                      onLogout()
                    }}
                  />
                ) : (
                  <MenuLink key={item.id} item={item} onNavigate={closeMenu} />
                )
              )}
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

const itemClasses = (active: boolean) =>
  cn(
    "group flex w-full items-center gap-3 rounded-button border-2 border-border-strong px-4 py-3 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
    active
      ? "bg-academy-ink text-content-inverse"
      : "bg-surface-card hover:bg-academy-yellow"
  )

function MenuLink({
  item,
  onNavigate,
}: {
  item: StudentNavItem
  onNavigate: () => void
}) {
  return (
    <Link
      to={item.href ?? "#"}
      onClick={onNavigate}
      className={itemClasses(item.active)}
    >
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

function MenuAction({
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
