/**
 * Checkout success / order status page labels — fetched from the Hygraph
 * `OrderStatusPage` model; unfilled fields fall back to the defaults below.
 */
import { getLocale } from "@academy/user-ui/lib/lang"
import { getOrderStatusPage } from "../graphql/queries/order-status"
import { fillLabels } from "./label-utils"

export interface OrderStatusLabels {
  completedTitle: string
  completedDescription: string
  pendingTitle: string
  pendingDescription: string
  failedTitle: string
  failedDescription: string
  startLearningCta: string
  retryCta: string
  backHomeCta: string
}

export const defaultOrderStatusLabels: OrderStatusLabels = {
  completedTitle: "¡Listo!",
  completedDescription:
    "Ya tienes acceso a tus cursos. Te enviamos la confirmación por correo.",
  pendingTitle: "Estamos procesando tu pago",
  pendingDescription:
    "Tu pago se está confirmando. En cuanto se acredite activaremos tus cursos y te avisaremos por correo.",
  failedTitle: "No se pudo completar el pago",
  failedDescription:
    "No se realizó ningún cargo. Revisa tus datos e inténtalo de nuevo.",
  startLearningCta: "Empezar a aprender",
  retryCta: "Reintentar pago",
  backHomeCta: "Volver al inicio",
}

export async function loadOrderStatusLabels(
  lang: string
): Promise<OrderStatusLabels> {
  const locale = getLocale(lang)
  try {
    const { orderStatusPages } = await getOrderStatusPage({
      variables: { locale },
    })
    return fillLabels(
      defaultOrderStatusLabels,
      (orderStatusPages[0] ?? null) as Record<string, unknown> | null
    )
  } catch {
    return defaultOrderStatusLabels
  }
}
