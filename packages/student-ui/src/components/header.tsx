import { LanguageSwitcher } from "@academy/user-ui/components/shared/language-switcher"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@academy/user-ui/components/ui/avatar"
import { Badge } from "@academy/user-ui/components/ui/badge"
import { Button } from "@academy/user-ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@academy/user-ui/components/ui/dropdown-menu"
import { Label } from "@academy/user-ui/components/ui/label"
import { Skeleton } from "@academy/user-ui/components/ui/skeleton"
import { cn } from "@academy/user-ui/lib/utils"
import {
  IconChevronDown,
  IconHelpCircle,
  IconLayoutDashboard,
  IconLogout,
  IconMoodSmile,
  IconSearch,
  IconShoppingCart,
  IconUser,
} from "@tabler/icons-react"
import { Link, useLocation, useParams } from "react-router"
import { dashboardBase } from "../lib/nav-items"
import type {
  StudentCartView,
  StudentLayoutLabels,
  StudentUser,
} from "../types/layout"
import { CommandMenu, useCommandMenu } from "./command-menu"

const DEFAULT_LOGO =
  "https://pub-b7daf0a886e34f2b8c2ab3497bc521f7.r2.dev/logos/uspk-a-logo-black.png"

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

export interface StudentHeaderProps {
  user: StudentUser | null
  labels: StudentLayoutLabels
  /** Drives the business vs. student navigation. */
  isBusinessUser?: boolean
  isLoading?: boolean
  /** The route submits to the logout action — this shell never mutates. */
  onLogout: () => void
  /** Cart preview for the header popover; non-business only. */
  cart?: StudentCartView | null
  /** Cross-origin link to the web app cart/checkout. */
  cartHref?: string
  helpHref?: string
  logoUrl?: string
}

export const StudentHeader = ({
  user,
  labels,
  isBusinessUser = false,
  isLoading,
  onLogout,
  cart,
  cartHref = "#",
  helpHref = "https://uspk.com.mx/contact",
  logoUrl = DEFAULT_LOGO,
}: StudentHeaderProps) => {
  const { pathname } = useLocation()
  const { lang = "es" } = useParams()
  const base = dashboardBase(lang)
  const commandMenu = useCommandMenu()

  const navLinks = isBusinessUser
    ? [
        { href: base, label: labels.nav.dashboard },
        { href: `${base}/team`, label: labels.nav.team },
        { href: `${base}/courses`, label: labels.nav.assignedCourses },
        { href: `${base}/reports`, label: labels.nav.reports },
      ]
    : [{ href: `${base}/courses`, label: labels.nav.myCourses }]

  const isActive = (href: string) =>
    href === base ? pathname === base : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-50 border-b-2 border-border-strong bg-academy-yellow">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4">
          <Link
            to={base}
            aria-label={labels.header.homeAria}
            className="shrink-0 transition-transform duration-150 ease-academy hover:rotate-2"
          >
            <img src={logoUrl} alt="" className="h-9 w-auto" />
          </Link>

          <button
            type="button"
            onClick={commandMenu.open}
            aria-label={labels.header.searchAria}
            className="hidden max-w-xl flex-1 md:block"
          >
            <div className="group relative">
              <IconSearch
                aria-hidden
                className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-content-muted transition-colors group-hover:text-content-primary"
              />
              <div className="w-full cursor-pointer rounded-button border-2 border-border-strong bg-surface-card py-2.5 pr-4 pl-12 text-left font-bold text-content-muted shadow-hard-xs transition-all duration-150 ease-academy group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-hard-sm">
                {labels.header.searchPlaceholder}
              </div>
              <kbd className="absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-sm border-2 border-border-strong bg-surface-muted px-2 py-1 text-label font-bold lg:inline-block">
                ⌘K
              </kbd>
            </div>
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            {isLoading ? (
              <NavSkeleton length={isBusinessUser ? 4 : 2} />
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "font-bold transition-colors hover:text-academy-blue",
                    isActive(link.href)
                      ? "text-content-primary"
                      : "text-content-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={labels.header.searchAria}
              onClick={commandMenu.open}
            >
              <IconSearch className="size-5" />
            </Button>

            {!isBusinessUser && (
              <CartMenu
                cart={cart ?? null}
                cartHref={cartHref}
                labels={labels}
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-auto gap-2 p-0 hover:bg-transparent rounded-card"
                    aria-label={labels.header.userMenuAria}
                  >
                    <>
                      <Avatar>
                        <AvatarImage
                          className="object-cover"
                          src={user?.profilePicture ?? ""}
                          alt=""
                        />
                        <AvatarFallback>
                          <IconMoodSmile className="size-full text-academy-yellow" />
                        </AvatarFallback>
                      </Avatar>
                      <IconChevronDown className="hidden size-4 md:block" />
                    </>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-64">
                <Label className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold">
                    {user?.fullName}
                  </span>
                  <span className="truncate text-label text-content-muted">
                    {user?.email}
                  </span>
                  {isBusinessUser && (
                    <Badge className="mt-2 w-fit border-2 border-border-strong bg-academy-blue text-content-inverse">
                      {labels.header.businessBadge}
                    </Badge>
                  )}
                </Label>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  render={
                    <Link to={base}>
                      <>
                        <IconLayoutDashboard className="size-4" />
                        <span>{labels.nav.dashboard}</span>
                      </>
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link to={`${base}/profile`}>
                      <>
                        <IconUser className="size-4" />
                        <span>{labels.nav.profile}</span>
                      </>
                    </Link>
                  }
                />

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <a href={helpHref} target="_blank" rel="noreferrer">
                      <>
                        <IconHelpCircle className="size-4" />
                        <span>{labels.nav.help}</span>
                      </>
                    </a>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-academy-coral"
                >
                  <IconLogout className="size-4" />
                  <span>{labels.nav.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <CommandMenu
        isOpen={commandMenu.isOpen}
        onClose={commandMenu.close}
        labels={labels}
        onLogout={onLogout}
        isBusinessUser={isBusinessUser}
      />
    </>
  )
}

function NavSkeleton({ length }: { length: number }) {
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <Skeleton key={index} className="h-5 w-28 rounded-sm" />
      ))}
    </>
  )
}

/**
 * Cart preview. Read-only on purpose — adding/removing lives in the web app's
 * cart page, which this links out to. The badge and popover only reflect what
 * the loader already fetched; the shell never mutates.
 */
function CartMenu({
  cart,
  cartHref,
  labels,
}: {
  cart: StudentCartView | null
  cartHref: string
  labels: StudentLayoutLabels
}) {
  const count = cart?.count ?? 0
  const items = cart?.items ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={labels.header.cartAria}
          >
            <>
              <IconShoppingCart className="size-5" />
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-coral p-0 text-label font-bold text-content-inverse">
                  {count}
                </Badge>
              )}
            </>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <Label className="px-2 py-1.5 text-card-title font-bold tracking-tight-brand">
          {labels.header.cartTitle}
          {count > 0 ? ` (${count})` : ""}
        </Label>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-content-muted">
            {labels.header.cartEmpty}
          </p>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-2 py-2"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-button border-2 border-border-strong bg-surface-muted">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-bold">
                    {item.title}
                    {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                  </p>
                  <span className="shrink-0 text-sm font-bold tabular-nums">
                    {money.format(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-bold text-content-muted">
                {labels.header.cartTotal}
              </span>
              <span className="text-card-title font-bold tabular-nums">
                {money.format(cart?.total ?? 0)}
              </span>
            </div>

            <DropdownMenuItem
              render={
                <a href={cartHref}>
                  <span className="flex w-full items-center justify-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs">
                    <IconShoppingCart className="size-4" />
                    {labels.header.cartCta}
                  </span>
                </a>
              }
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
