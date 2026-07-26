/**
 * Contracts for the student dashboard shell (header / sidebar / mobile nav).
 *
 * Presentational on purpose: the shell never talks to GraphQL. The route maps
 * `me` onto `StudentUser` and passes `onLogout` (which submits to the logout
 * action), matching how the marketing header works.
 *
 * Copy follows the repo-wide i18n architecture — every string arrives as a
 * label. `defaultStudentLayoutLabels` keeps the shell working today; swap in a
 * Hygraph `StudentLayoutPage` model later without touching components.
 */

export interface StudentUser {
  fullName: string | null
  email: string | null
  userName: string | null
  profilePicture: string | null
}

/** One row in the header's notification dropdown. */
export interface StudentNotification {
  id: string
  title: string
  description: string
  /** Pre-formatted relative time ("2h", "1d") — formatting stays in the route. */
  timeAgo: string
}

/** One line in the header's cart preview. */
export interface StudentCartItem {
  id: string
  title: string
  image: string | null
  quantity: number
  unitPrice: number
}

/** Cart preview shown in the header popover (non-business only). */
export interface StudentCartView {
  count: number
  total: number
  items: StudentCartItem[]
}

export interface StudentNavLabels {
  dashboard: string
  team: string
  assignedCourses: string
  reports: string
  myCourses: string
  explore: string
  profile: string
  wishlist: string
  reviews: string
  quizAttempts: string
  orderHistory: string
  calendar: string
  certificates: string
  subscription: string
  notifications: string
  settings: string
  logout: string
  help: string
}

export interface StudentHeaderLabels {
  homeAria: string
  searchPlaceholder: string
  searchAria: string
  notificationsTitle: string
  notificationsAria: string
  cartAria: string
  cartTitle: string
  cartEmpty: string
  cartTotal: string
  cartCta: string
  userMenuAria: string
  businessBadge: string
  /** Shown on the sidebar profile card. */
  businessAccountBadge: string
}

export interface StudentMobileLabels {
  menuLabel: string
  menuTitle: string
  closeMenuAria: string
  home: string
  courses: string
  profile: string
  team: string
}

export interface StudentCommandMenuLabels {
  placeholder: string
  emptyText: string
  navigationGroup: string
  settingsGroup: string
  closeAria: string
}

export interface StudentLayoutLabels {
  nav: StudentNavLabels
  header: StudentHeaderLabels
  mobile: StudentMobileLabels
  commandMenu: StudentCommandMenuLabels
  /** Badge shown next to brand-new nav entries. */
  newBadge: string
}

export const defaultStudentLayoutLabels: StudentLayoutLabels = {
  nav: {
    dashboard: "Dashboard",
    team: "Mi Equipo",
    assignedCourses: "Cursos Asignados",
    reports: "Reportes",
    myCourses: "Mis Cursos",
    explore: "Explorar",
    profile: "Mi Perfil",
    wishlist: "Lista de Deseos",
    reviews: "Reseñas",
    quizAttempts: "Intentos de Quizzes",
    orderHistory: "Historial de Órdenes",
    calendar: "Calendario",
    certificates: "Certificados",
    subscription: "Mi Suscripción",
    notifications: "Notificaciones",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    help: "Ayuda",
  },
  header: {
    homeAria: "Ir al inicio",
    searchPlaceholder: "Buscar cursos, instructores...",
    searchAria: "Buscar",
    notificationsTitle: "Notificaciones",
    notificationsAria: "Ver notificaciones",
    cartAria: "Ver carrito",
    cartTitle: "Tu carrito",
    cartEmpty: "Tu carrito está vacío.",
    cartTotal: "Total",
    cartCta: "Ir al carrito",
    userMenuAria: "Abrir menú de usuario",
    businessBadge: "Business",
    businessAccountBadge: "Business Account",
  },
  mobile: {
    menuLabel: "Menú",
    menuTitle: "Menú",
    closeMenuAria: "Cerrar menú",
    home: "Inicio",
    courses: "Mis Cursos",
    profile: "Perfil",
    team: "Mi Equipo",
  },
  commandMenu: {
    placeholder: "Escribe un comando o busca...",
    emptyText: "Sin resultados.",
    navigationGroup: "Navegación",
    settingsGroup: "Ajustes",
    closeAria: "Cerrar buscador",
  },
  newBadge: "Nuevo",
}
