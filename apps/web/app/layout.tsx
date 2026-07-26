import { getSiteConfigs } from "@academy/cms/graphql/queries/site-configs"
import { getCart } from "@academy/courses-api/graphql/queries/cart"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import { Header } from "@academy/user-ui/components"
import { Footer } from "@academy/user-ui/components/shared/footer"
import { getLocale } from "@academy/user-ui/lib/lang"
import type { AuthState } from "@academy/user-ui/types/api"
import { type ReactNode, useEffect, useRef } from "react"
import { Outlet } from "react-router"
import type { Route } from "./+types/layout"
import { usePostHog } from "@posthog/react"

export async function loader({ params, request }: Route.LoaderArgs) {
  const locales = getLocale(params.lang)

  const [{ siteConfigs }, me, cart] = await Promise.all([
    getSiteConfigs({
      variables: { locales: [locales] },
    }),
    getMe(request),
    getCart(request),
  ])

  const siteConfig = siteConfigs[0]

  const user = me?.me
  const auth: AuthState = user
    ? {
        status: "authenticated",
        user: {
          id: user.customerId,
          name: user.fullName,
          email: user.email,
          avatarUrl: user.profilePicture ?? undefined,
        },
      }
    : { status: "anonymous" }

  const navLinks = siteConfig.navLinks.map((item) => ({
    ...item,
    external: item.external ?? false,
    order: item.order ?? 1,
  }))

  return {
    navLinks,
    footerColumns: siteConfig.footerColumns,
    siteConfig,
    auth,
    cart,
  }
}

export default function Layout({
  loaderData,
  children,
}: Route.ComponentProps & { children: ReactNode }) {
  const { navLinks, auth, siteConfig, footerColumns, cart } = loaderData
  const posthog = usePostHog()

  const userId = auth.status === "authenticated" ? auth.user.id : null
  const prevUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (userId) {
      posthog?.identify(userId, {
        name: auth.status === "authenticated" ? auth.user.name : undefined,
        email: auth.status === "authenticated" ? auth.user.email : undefined,
      })
    } else if (prevUserIdRef.current) {
      posthog?.reset()
    }
    prevUserIdRef.current = userId
  }, [userId])

  return (
    <>
      <Header
        navLinks={navLinks}
        auth={auth}
        itemsInCart={cart.cart?.items.length ?? 0}
      />
      {children}
      <Outlet />
      <Footer data={{ ...(siteConfig as any), ...footerColumns }} />
    </>
  )
}
