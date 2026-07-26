import { getMyCart } from "@academy/courses-api/graphql/student-app/queries/cart"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import {
  defaultStudentLayoutLabels,
  StudentHeader,
  StudentMobileNav,
  StudentSidebar,
  type StudentUser,
} from "@academy/student-ui/components"
import type { StudentCartView } from "@academy/student-ui/types/layout"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { marketingUrlFor } from "@academy/user-ui/lib/site-urls"
import { Outlet, useParams, useSubmit } from "react-router"
import type { Route } from "./+types/layout"

export const middleware = [authMiddleware]

export async function loader({ request, params }: Route.LoaderArgs) {
  const [me, cartResult] = await Promise.all([getMe(request), getMyCart(request)])
  const user = me?.me

  const studentUser: StudentUser | null = user
    ? {
        fullName: user.fullName,
        email: user.email,
        // Not selected by the `me` query yet — surfaced as null for now.
        userName: null,
        profilePicture: user.profilePicture,
      }
    : null

  const rawCart = cartResult?.cart
  const cart: StudentCartView | null = rawCart
    ? {
        count: rawCart.items.reduce((sum, line) => sum + line.quantity, 0),
        total: rawCart.total,
        items: rawCart.items.map((line) => {
          const detail = line.item
          return {
            id: line.id,
            title:
              detail.__typename === "SubscriptionPlan"
                ? (detail.planName ?? "Suscripción")
                : (detail.title ?? "Producto"),
            image:
              detail.__typename === "SubscriptionPlan"
                ? null
                : (detail.featuredImage ?? null),
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          }
        }),
      }
    : null

  return {
    user: studentUser,
    cart,
    // The cart/checkout pages live on the apex/web app (cross-origin in prod).
    cartHref: marketingUrlFor(params.lang, "cart"),
    // TODO(hygraph): swap for a StudentLayoutPage model, same pattern as the
    // marketing loaders (defaults keep the shell working meanwhile).
    labels: defaultStudentLayoutLabels,
    // Company admins carry the "business" role and get the team-oriented shell;
    // enterprise learners keep the student shell even though they have a company.
    isBusinessUser: user?.role === "business",
  }
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  const { user, labels, isBusinessUser, cart, cartHref } = loaderData
  const { lang } = useParams()
  const submit = useSubmit()

  const onLogout = () =>
    submit(null, { method: "post", action: `/${lang}/logout` })

  return (
    <div className="min-h-screen bg-surface-page">
      <StudentHeader
        user={user}
        labels={labels}
        isBusinessUser={isBusinessUser}
        onLogout={onLogout}
        cart={cart}
        cartHref={cartHref}
      />
      <div className="mx-auto grid max-w-7xl gap-stack-lg p-card pb-28 md:grid-cols-[280px_1fr] md:pb-card">
        <StudentSidebar
          user={user}
          labels={labels}
          isBusinessUser={isBusinessUser}
          onLogout={onLogout}
        />
        <main className="space-y-stack-lg">
          <Outlet />
        </main>
      </div>
      <StudentMobileNav
        user={user}
        labels={labels}
        isBusinessUser={isBusinessUser}
        onLogout={onLogout}
      />
    </div>
  )
}
