export interface HeaderLabels {
  userMenu: {
    learning: string
    cart: string
    profile: string
    logout: string
  }
  search: {
    trigger: string
    placeholder: string
    empty: string
    pagesGroup: string
    coursesGroup: string
  }
  closeMenu: string
  cartAria: string
}

export const defaultHeaderLabels: HeaderLabels = {
  userMenu: {
    learning: "Mi Aprendizaje",
    cart: "Mi Carrito",
    profile: "Mi Perfil",
    logout: "Cerrar sesión",
  },
  search: {
    trigger: "Buscar",
    placeholder: "Buscar páginas y cursos...",
    empty: "No hay resultados.",
    pagesGroup: "Páginas",
    coursesGroup: "Cursos",
  },
  closeMenu: "Cerrar menú",
  cartAria: "Ver artículos en el carrito",
}

export const headerLabels: Record<"es" | "en", HeaderLabels> = {
  es: defaultHeaderLabels,
  en: {
    userMenu: {
      learning: "My Learning",
      cart: "My Cart",
      profile: "My Profile",
      logout: "Log out",
    },
    search: {
      trigger: "Search",
      placeholder: "Search pages and courses...",
      empty: "No results.",
      pagesGroup: "Pages",
      coursesGroup: "Courses",
    },
    closeMenu: "Close menu",
    cartAria: "View items in cart",
  },
}
