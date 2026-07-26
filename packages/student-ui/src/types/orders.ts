/**
 * Presentational contract for the order history. The route maps `myOrders`
 * onto `StudentOrder`; the page never touches GraphQL.
 *
 * One card per ORDER, with its items listed inside — a single checkout can mix
 * courses and bundles, so a card per item would misrepresent the purchase.
 */

export type OrderStatus =
  | "completed"
  | "pending"
  | "failed"
  | "refunded"
  | "partially_refunded"
export type OrderItemType = "COURSE" | "BUNDLE" | "SUBSCRIPTION"

export interface StudentOrderItem {
  itemType: OrderItemType
  itemId: string
  title: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
}

export interface StudentOrder {
  id: string
  status: OrderStatus
  /** Total charged. Subtotal/tax aren't stored per order. */
  amount: number
  /** ISO 4217, lowercase from Stripe (e.g. "mxn"). */
  currency: string
  cardBrand: string | null
  cardLast4: string | null
  /** Stripe-hosted receipt; absent for orders placed before capture landed. */
  receiptUrl: string | null
  /** ISO — rendered with Intl in the component. */
  createdAt: string
  /** Cumulative amount returned; 0 unless refunded. */
  refundedAmount: number
  /** ISO, when the refund was recorded. */
  refundedAt: string | null
  /**
   * Empty until the payment settles: items are written when the checkout
   * completes, so pending (e.g. OXXO) and failed orders carry none.
   */
  items: StudentOrderItem[]
  /**
   * OXXO voucher, so a customer who lost their reference can reprint it. The
   * API only returns these while the order is pending.
   */
  voucherUrl: string | null
  voucherReference: string | null
  /** ISO. May already be in the past — the UI says so rather than hiding it. */
  voucherExpiresAt: string | null
}

export type OrderStatusFilter = "all" | OrderStatus

export interface OrderHistoryPageLabels {
  pageTitle: string
  totalSuffixSingular: string
  totalSuffixPlural: string
  spentSuffix: string
  statsTotal: string
  statsSpent: string
  statsCourses: string
  statsBundles: string
  statsSubscriptions: string
  filterLabel: string
  filterAll: string
  filterCompleted: string
  filterPending: string
  filterFailed: string
  filterRefunded: string
  searchPlaceholder: string
  searchAria: string
  resultsSingular: string
  resultsPlural: string
  statusCompleted: string
  statusPending: string
  statusFailed: string
  statusRefunded: string
  statusPartiallyRefunded: string
  /** `{amount}` is replaced with the refunded total. */
  refundedNoticeFull: string
  refundedNoticePartial: string
  refundedAccessRevoked: string
  totalLabel: string
  paymentMethodLabel: string
  /** `{brand}` and `{last4}` are replaced with the card details. */
  cardFormat: string
  paymentMethodUnknown: string
  /** `{n}` is replaced with the item count. */
  itemsSingular: string
  itemsPlural: string
  noItemsPending: string
  noItemsFailed: string
  receiptCta: string
  voucherTitle: string
  voucherHelp: string
  voucherReferenceLabel: string
  voucherCopyCta: string
  voucherCopiedCta: string
  voucherOpenCta: string
  /** `{date}` is replaced with the expiry date. */
  voucherExpiresLabel: string
  voucherExpiredLabel: string
  orderReference: string
  typeCourse: string
  typeBundle: string
  typeSubscription: string
  emptyTitle: string
  emptyDescription: string
  emptyCta: string
  noResultsTitle: string
  /** `{query}` is replaced with the search text. */
  noResultsWithQuery: string
  noResultsDescription: string
  clearFiltersCta: string
}

export const defaultOrderHistoryPageLabels: OrderHistoryPageLabels = {
  pageTitle: "Historial de Órdenes",
  totalSuffixSingular: "orden",
  totalSuffixPlural: "órdenes",
  spentSuffix: "Total gastado",
  statsTotal: "Total Órdenes",
  statsSpent: "Total Gastado",
  statsCourses: "Cursos",
  statsBundles: "Bundles",
  statsSubscriptions: "Suscripciones",
  filterLabel: "Filtrar:",
  filterAll: "Todas",
  filterCompleted: "Pagadas",
  filterPending: "Pendientes",
  filterFailed: "Fallidas",
  filterRefunded: "Reembolsadas",
  searchPlaceholder: "Buscar por curso o número de orden…",
  searchAria: "Buscar órdenes",
  resultsSingular: "resultado",
  resultsPlural: "resultados",
  statusCompleted: "Pagada",
  statusPending: "Pendiente",
  statusFailed: "Fallida",
  statusRefunded: "Reembolsada",
  statusPartiallyRefunded: "Reembolso parcial",
  refundedNoticeFull: "Se te reembolsaron {amount}.",
  refundedNoticePartial: "Se te reembolsaron {amount} de esta orden.",
  refundedAccessRevoked: "El acceso a los cursos de esta orden fue retirado.",
  totalLabel: "Total",
  paymentMethodLabel: "Método de pago",
  cardFormat: "{brand} ····{last4}",
  paymentMethodUnknown: "No disponible",
  itemsSingular: "artículo",
  itemsPlural: "artículos",
  noItemsPending: "El detalle aparecerá cuando se confirme el pago.",
  noItemsFailed: "El pago no se completó, no se registraron artículos.",
  receiptCta: "Ver recibo",
  voucherTitle: "Ficha de pago OXXO",
  voucherHelp:
    "Presenta esta referencia en cualquier tienda OXXO para completar tu pago.",
  voucherReferenceLabel: "Referencia",
  voucherCopyCta: "Copiar",
  voucherCopiedCta: "¡Copiada!",
  voucherOpenCta: "Ver ficha",
  voucherExpiresLabel: "Vence el {date}",
  voucherExpiredLabel: "Esta ficha ya venció.",
  orderReference: "Orden",
  typeCourse: "Curso",
  typeBundle: "Bundle",
  typeSubscription: "Suscripción",
  emptyTitle: "Sin órdenes aún",
  emptyDescription:
    "Cuando compres un curso o un bundle, aparecerá aquí con su recibo.",
  emptyCta: "Explorar cursos",
  noResultsTitle: "No se encontraron órdenes",
  noResultsWithQuery: "No hay órdenes que coincidan con «{query}».",
  noResultsDescription: "Intenta con otro filtro para ver más resultados.",
  clearFiltersCta: "Limpiar filtros",
}
