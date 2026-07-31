import { IconChevronRight, IconLogout } from "@tabler/icons-react"
import { Link, useLocation } from "react-router"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@academy/user-ui/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@academy/user-ui/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@academy/admin-ui/components/ui/collapsible"
import {
  platformNav,
  toolsNav,
  visibleNav,
  type AdminNavItemWithIcon,
} from "@academy/admin-ui/components/shell/nav-config"
import type { AdminUser } from "@academy/admin-ui/types/shell"

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

const activeClasses =
  "data-active:bg-academy-yellow data-active:font-bold data-active:text-content-primary"

function NavEntry({
  item,
  pathname,
}: {
  item: AdminNavItemWithIcon
  pathname: string
}) {
  const Icon = item.icon
  // A parent is active for its own path and anything nested underneath, so
  // "/courses/levels" keeps "Cursos" highlighted and expanded.
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.title}
          className={activeClasses}
          render={<Link to={item.href} />}
        >
          <Icon className="size-4" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible defaultOpen={isActive} render={<SidebarMenuItem />}>
      <SidebarMenuButton
        isActive={pathname === item.href}
        tooltip={item.title}
        className={activeClasses}
        render={<Link to={item.href} />}
      >
        <Icon className="size-4" />
        <span>{item.title}</span>
      </SidebarMenuButton>
      <CollapsibleTrigger
        className="absolute top-1.5 right-1 flex size-5 items-center justify-center rounded-md text-content-muted transition-transform hover:bg-academy-yellow-soft data-panel-open:rotate-90"
        aria-label={`Alternar ${item.title}`}
      >
        <IconChevronRight className="size-4" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className="border-l-2 border-border-subtle">
          {item.items.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton
                isActive={pathname === child.href}
                className="data-active:bg-academy-yellow-soft data-active:font-bold"
                render={<Link to={child.href} />}
              >
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function AdminSidebar({
  user,
  onLogout,
}: {
  user: AdminUser
  onLogout: () => void
}) {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-border-strong">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/courses" />}>
              <span className="flex aspect-square size-8 items-center justify-center rounded-button border-2 border-border-strong bg-academy-yellow font-heading text-sm shadow-hard-xs">
                UA
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold tracking-tight-brand">
                  USPK Academy
                </span>
                <span className="truncate text-label text-content-muted">
                  Panel de administración
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-label font-bold tracking-tight-brand uppercase">
            Plataforma
          </SidebarGroupLabel>
          <SidebarMenu>
            {visibleNav(platformNav, user.role).map((item) => (
              <NavEntry key={item.href} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-label font-bold tracking-tight-brand uppercase">
            Herramientas
          </SidebarGroupLabel>
          <SidebarMenu>
            {visibleNav(toolsNav, user.role).map((item) => (
              <NavEntry key={item.href} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-border-subtle">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/account/change-password" />}
            >
              <Avatar className="size-8 rounded-button border-2 border-border-strong">
                {user.profilePicture && (
                  <AvatarImage src={user.profilePicture} alt={user.fullName} />
                )}
                <AvatarFallback className="rounded-button bg-academy-blue-soft font-bold">
                  {initials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold">{user.fullName}</span>
                <span className="truncate text-label text-content-muted">
                  {user.email}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip="Cerrar sesión">
              <IconLogout className="size-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
