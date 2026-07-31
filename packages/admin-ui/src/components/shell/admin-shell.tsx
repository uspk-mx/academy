import type { ReactNode } from "react"

import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@academy/user-ui/components/ui/sidebar"
import { AdminSidebar } from "@academy/admin-ui/components/shell/admin-sidebar"
import type { AdminUser } from "@academy/admin-ui/types/shell"

export function AdminShell({
  user,
  sidebarOpen,
  onLogout,
  children,
}: {
  user: AdminUser
  /** Persisted rail state, read from the `sidebar_state` cookie server-side so
   *  the first paint matches what the visitor left open. */
  sidebarOpen: boolean
  onLogout: () => void
  children: ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AdminSidebar user={user} onLogout={onLogout} />
      <SidebarRail />
      <SidebarInset className="bg-surface-page">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b-2 border-border-strong bg-surface-card px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col gap-5 p-card">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Page heading + primary action, used above every list. */
export function PageHeading({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-section-title leading-display font-bold tracking-display">
        {title}
      </h1>
      {action}
    </div>
  )
}
