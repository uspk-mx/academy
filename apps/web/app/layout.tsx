import { loadSiteConfig } from "@academy/cms/loaders/site-config"
import { getCart } from "@academy/courses-api/graphql/queries/cart"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import { Header } from "@academy/user-ui/components"
import { Footer } from "@academy/user-ui/components/shared/footer"
import type { AuthState } from "@academy/user-ui/types/api"
import { type ReactNode, useEffect, useRef } from "react"
import { Outlet } from "react-router"
import type { Route } from "./+types/layout"
import { usePostHog } from "@posthog/react"

export async function loader({ params, request }: Route.LoaderArgs) {
  const [{ siteConfig, navLinks, footerColumns }, me, cart] = await Promise.all(
    [loadSiteConfig({ lang: params.lang }), getMe(request), getCart(request)]
  )

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

  return {
    navLinks,
    footerColumns,
    siteConfig,
    auth,
    cart,
    login: {
      label: siteConfig.loginLabel ?? "",
      href: siteConfig.loginHref ?? "",
    },
    signup: {
      label: siteConfig.ctaLabel ?? "",
      href: siteConfig.ctaHref ?? "",
    },
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
        login={loaderData.login}
        signup={loaderData.signup}
      />
      {children}
      <Outlet />
      <Footer
        data={{
          footerTagline: siteConfig.footerTagline ?? "",
          footerCopyright: siteConfig.footerCopyright ?? "",
          footerColumns,
        }}
      />
    </>
  )
}
