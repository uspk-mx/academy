import type { Icon } from "@tabler/icons-react"
import {
  IconAward,
  IconBook2,
  IconChartBar,
  IconHelpCircle,
  IconLayoutDashboard,
  IconLogout,
  IconRosette,
  IconSettings2,
  IconShoppingCart,
  IconStar,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react"
import type { StudentLayoutLabels } from "../types/layout"

export interface StudentNavItem {
  id: string
  label: string
  icon: Icon
  /** Absolute, lang-scoped. Absent for actions (logout). */
  href?: string
  active: boolean
  badge?: string
  showInSidebar: boolean
  /** Rendered as a button that calls `onLogout` instead of a link. */
  isLogout?: boolean
}

export interface NavItemsArgs {
  lang: string
  pathname: string
  isBusinessUser?: boolean
  labels: StudentLayoutLabels
}

/** Every dashboard route lives under `/:lang/dashboard`. */
export function dashboardBase(lang: string): string {
  return `/${lang}/dashboard`
}

/** Exact match for the index, prefix match for children. */
function isActive(pathname: string, href: string, base: string): boolean {
  if (href === base) return pathname === base || pathname === `${base}/`
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Single source of truth for dashboard navigation — shared by the sidebar and
 * the mobile menu so they can never drift apart.
 */
export function getStudentNavItems({
  lang,
  pathname,
  isBusinessUser,
  labels,
}: NavItemsArgs): StudentNavItem[] {
  const base = dashboardBase(lang)
  const item = (
    id: string,
    label: string,
    icon: Icon,
    path: string,
    extra?: Partial<StudentNavItem>
  ): StudentNavItem => {
    const href = path === "" ? base : `${base}/${path}`
    return {
      id,
      label,
      icon,
      href,
      active: isActive(pathname, href, base),
      showInSidebar: true,
      ...extra,
    }
  }

  const logout: StudentNavItem = {
    id: "logout",
    label: labels.nav.logout,
    icon: IconLogout,
    active: false,
    showInSidebar: true,
    isLogout: true,
  }

  if (isBusinessUser) {
    return [
      item("dashboard", labels.nav.dashboard, IconLayoutDashboard, ""),
      item("team", labels.nav.team, IconUsersGroup, "team"),
      item("courses", labels.nav.assignedCourses, IconBook2, "courses"),
      item("reports", labels.nav.reports, IconChartBar, "reports"),
      item("reviews", labels.nav.reviews, IconStar, "reviews"),
      item("certificates", labels.nav.certificates, IconAward, "certificates"),
      item("settings", labels.nav.settings, IconSettings2, "profile"),
      logout,
    ]
  }

  // Only destinations that have a real route ship in the nav — no dead ends.
  return [
    item("dashboard", labels.nav.dashboard, IconLayoutDashboard, ""),
    item("profile", labels.nav.profile, IconUser, "profile"),
    item("courses", labels.nav.myCourses, IconBook2, "courses"),
    item("reviews", labels.nav.reviews, IconStar, "reviews"),
    item("quiz-attempts", labels.nav.quizAttempts, IconHelpCircle, "quiz-attempts"),
    item("certificates", labels.nav.certificates, IconAward, "certificates"),
    item("subscription", labels.nav.subscription, IconRosette, "subscription"),
    item("order-history", labels.nav.orderHistory, IconShoppingCart, "order-history"),
    logout,
  ]
}

/** Bottom bar on mobile: the 3 highest-traffic destinations. */
export function getPrimaryMobileNavItems({
  lang,
  pathname,
  isBusinessUser,
  labels,
}: NavItemsArgs): StudentNavItem[] {
  const all = getStudentNavItems({ lang, pathname, isBusinessUser, labels })
  const byId = (id: string) => all.find((navItem) => navItem.id === id)!
  const ids = isBusinessUser
    ? ["dashboard", "team", "courses"]
    : ["dashboard", "courses", "profile"]
  const mobileLabels: Record<string, string> = {
    dashboard: labels.mobile.home,
    courses: labels.mobile.courses,
    profile: labels.mobile.profile,
    team: labels.mobile.team,
  }
  return ids.map((id) => ({
    ...byId(id),
    label: mobileLabels[id] ?? byId(id).label,
  }))
}
