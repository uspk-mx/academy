import { getMyOrders } from "@academy/courses-api/graphql/student-app/queries/orders"
import { StudentOrderHistoryPage } from "@academy/student-ui/components/pages/order-history-page"
import {
  defaultOrderHistoryPageLabels,
  type OrderItemType,
  type OrderStatus,
  type StudentOrder,
} from "@academy/student-ui/types/orders"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { useParams } from "react-router"
import type { Route } from "./+types/order-history"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Historial de órdenes" },
    {
      name: "description",
      content:
        "Historial de órdenes de Uspk Academy, revisa tus compras y recibos.",
    },
  ]
}

const ORDER_STATUSES: OrderStatus[] = [
  "completed",
  "pending",
  "failed",
  "refunded",
  "partially_refunded",
]
const ITEM_TYPES: OrderItemType[] = ["COURSE", "BUNDLE", "SUBSCRIPTION"]

/** The API returns free-form strings; keep the view model closed. */
function toStatus(value: string): OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "pending"
}

function toItemType(value: string): OrderItemType {
  return ITEM_TYPES.includes(value as OrderItemType)
    ? (value as OrderItemType)
    : "COURSE"
}

/**
 * Orders come back newest-first and already filtered server-side: checkouts
 * abandoned before reaching Stripe are excluded, so the history has no phantom
 * pending rows.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const result = await getMyOrders(request)
  const rows = result?.myOrders ?? []

  const orders: StudentOrder[] = rows.map((order) => ({
    id: order.id,
    status: toStatus(order.status),
    amount: order.amount ?? 0,
    currency: order.currency || "mxn",
    cardBrand: order.cardBrand ?? null,
    cardLast4: order.cardLast4 ?? null,
    receiptUrl: order.receiptUrl ?? null,
    createdAt: order.createdAt ?? "",
    refundedAmount: order.refundedAmount ?? 0,
    refundedAt: order.refundedAt ?? null,
    // Returned only while pending; the API withholds them once settled.
    voucherUrl: order.voucherUrl ?? null,
    voucherReference: order.voucherReference ?? null,
    voucherExpiresAt: order.voucherExpiresAt ?? null,
    items: (order.items ?? []).map((item) => ({
      itemType: toItemType(item.itemType),
      itemId: item.itemId,
      title: item.title ?? null,
      imageUrl: item.featuredImage || null,
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
    })),
  }))

  return {
    orders,
    // TODO(hygraph): swap for a StudentOrderHistoryPage model, same pattern as
    // the marketing loaders (defaults keep the page working meanwhile).
    labels: defaultOrderHistoryPageLabels,
  }
}

export default function OrderHistory({ loaderData }: Route.ComponentProps) {
  const { orders, labels } = loaderData
  const { lang } = useParams()

  return (
    <StudentOrderHistoryPage
      orders={orders}
      labels={labels}
      exploreHref={`/${lang}/dashboard/courses`}
    />
  )
}
