import {
  IconAward,
  IconBook,
  IconBuilding,
  IconChartBar,
  IconLayersSubtract,
  IconMessage,
  IconRoute,
  IconSchool,
  IconTag,
  IconUsersGroup,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import type { AdminNavItem } from "@academy/admin-ui/types/shell"

export type AdminNavItemWithIcon = AdminNavItem & {
  icon: ComponentType<{ className?: string }>
  /** Roles allowed to see the entry; absent means "all staff". */
  roles?: string[]
}

export const platformNav: AdminNavItemWithIcon[] = [
  {
    title: "Cursos",
    href: "/courses",
    icon: IconBook,
    items: [
      { title: "Niveles", href: "/courses/levels" },
      { title: "Categorías", href: "/courses/categories" },
      { title: "Inscripciones", href: "/courses/enrollments" },
    ],
  },
  { title: "Learning Paths", href: "/learning-paths", icon: IconRoute },
  { title: "Bundles", href: "/bundles", icon: IconLayersSubtract },
  { title: "Estudiantes", href: "/students", icon: IconUsersGroup },
  { title: "Instructores", href: "/instructors", icon: IconSchool },
  {
    title: "Membresías",
    href: "/memberships",
    icon: IconTag,
    roles: ["admin"],
  },
  {
    title: "Empresas",
    href: "/companies",
    icon: IconBuilding,
    roles: ["admin"],
  },
]

export const toolsNav: AdminNavItemWithIcon[] = [
  {
    title: "Certificados",
    href: "/certificates",
    icon: IconAward,
    items: [{ title: "Plantillas", href: "/certificates/templates" }],
  },
  { title: "Comunicación", href: "/communication", icon: IconMessage },
  { title: "Performance", href: "/performance", icon: IconChartBar },
]

export function visibleNav(
  items: AdminNavItemWithIcon[],
  role: string
): AdminNavItemWithIcon[] {
  return items.filter((item) => !item.roles || item.roles.includes(role))
}
