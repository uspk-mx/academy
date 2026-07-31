export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: string
  profilePicture: string | null
}

export interface AdminNavItem {
  title: string
  href: string
  /** Nested links rendered as a collapsible sub-list. */
  items?: { title: string; href: string }[]
}

export interface AdminNavGroup {
  title: string
  items: AdminNavItem[]
}
