/**
 * Presentational contract for the student profile page. The route maps
 * `getProfile` onto `StudentProfile`; the page never touches GraphQL.
 */

export interface StudentProfile {
  fullName: string
  userName: string
  email: string
  phoneNumber: string
  major: string
  occupation: string
  interests: string[]
  profilePicture: string | null
  isActive: boolean
  /** ISO — rendered with Intl in the component. */
  createdAt: string
  updatedAt: string | null
}

export type ProfileField =
  | "fullName"
  | "userName"
  | "email"
  | "phoneNumber"
  | "major"
  | "occupation"
  | "avatar"

/** Actions return CODES (keys of `ProfileErrorLabels`), never raw copy. */
export interface ProfileActionData {
  ok?: boolean
  formError?: string
  fieldErrors?: Partial<Record<ProfileField, string>>
}

export interface ProfileErrorLabels {
  required: string
  invalidEmail: string
  imageTooLarge: string
  imageType: string
  uploadFailed: string
  generic: string
}

export interface ProfilePageLabels {
  pageTitle: string
  editCta: string
  saveCta: string
  savingCta: string
  cancelCta: string
  savedNotice: string
  /** Avatar overlay + file input. */
  changePhotoCta: string
  avatarAria: string
  activeLabel: string
  inactiveLabel: string
  accountSectionTitle: string
  registeredAtLabel: string
  updatedAtLabel: string
  neverUpdated: string
  personalSectionTitle: string
  professionalSectionTitle: string
  interestsSectionTitle: string
  fullNameLabel: string
  userNameLabel: string
  emailLabel: string
  phoneLabel: string
  occupationLabel: string
  majorLabel: string
  newInterestPlaceholder: string
  addInterestCta: string
  removeInterestAria: string
  noInterests: string
  errors: ProfileErrorLabels
}

export const defaultProfilePageLabels: ProfilePageLabels = {
  pageTitle: "Mi Perfil",
  editCta: "Editar perfil",
  saveCta: "Guardar cambios",
  savingCta: "Guardando…",
  cancelCta: "Cancelar",
  savedNotice: "Perfil actualizado correctamente.",
  changePhotoCta: "Cambiar foto",
  avatarAria: "Foto de perfil",
  activeLabel: "Activo",
  inactiveLabel: "Inactivo",
  accountSectionTitle: "Información de la cuenta",
  registeredAtLabel: "Registrado el",
  updatedAtLabel: "Última actualización",
  neverUpdated: "Sin actualizar",
  personalSectionTitle: "Información personal",
  professionalSectionTitle: "Información profesional",
  interestsSectionTitle: "Intereses",
  fullNameLabel: "Nombre completo",
  userNameLabel: "Usuario",
  emailLabel: "Correo electrónico",
  phoneLabel: "Teléfono",
  occupationLabel: "Ocupación",
  majorLabel: "Carrera",
  newInterestPlaceholder: "Agrega un nuevo interés",
  addInterestCta: "Agregar",
  removeInterestAria: "Quitar interés",
  noInterests: "Aún no has agregado intereses.",
  errors: {
    required: "Este campo es obligatorio.",
    invalidEmail: "Escribe un correo válido.",
    imageTooLarge: "La imagen supera el tamaño máximo de 5 MB.",
    imageType: "Formato no admitido. Usa JPG, PNG, GIF o WebP.",
    uploadFailed: "No pudimos subir la imagen. Intenta de nuevo.",
    generic: "Algo salió mal. Inténtalo de nuevo más tarde.",
  },
}

export const profilePageLabels: Record<"es" | "en", ProfilePageLabels> = {
  es: defaultProfilePageLabels,
  en: {
    pageTitle: "My Profile",
    editCta: "Edit profile",
    saveCta: "Save changes",
    savingCta: "Saving…",
    cancelCta: "Cancel",
    savedNotice: "Profile updated successfully.",
    changePhotoCta: "Change photo",
    avatarAria: "Profile photo",
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    accountSectionTitle: "Account information",
    registeredAtLabel: "Registered on",
    updatedAtLabel: "Last updated",
    neverUpdated: "Never updated",
    personalSectionTitle: "Personal information",
    professionalSectionTitle: "Professional information",
    interestsSectionTitle: "Interests",
    fullNameLabel: "Full name",
    userNameLabel: "Username",
    emailLabel: "Email",
    phoneLabel: "Phone",
    occupationLabel: "Occupation",
    majorLabel: "Major",
    newInterestPlaceholder: "Add a new interest",
    addInterestCta: "Add",
    removeInterestAria: "Remove interest",
    noInterests: "You haven't added any interests yet.",
    errors: {
      required: "This field is required.",
      invalidEmail: "Enter a valid email.",
      imageTooLarge: "The image exceeds the 5 MB maximum size.",
      imageType: "Unsupported format. Use JPG, PNG, GIF or WebP.",
      uploadFailed: "We couldn't upload the image. Try again.",
      generic: "Something went wrong. Please try again later.",
    },
  },
}
