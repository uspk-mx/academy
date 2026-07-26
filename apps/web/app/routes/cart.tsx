import { loadCartPage } from "@academy/cms/loaders/cart"
import { loadCommonLabels } from "@academy/cms/loaders/common-labels"
import {
  addToCartMutation,
  removeCartMutation,
  type AddToCartResult,
  type AddToCartVariables,
  type RemoveCartVariables,
} from "@academy/courses-api/graphql/mutations/cart"
import { getCart } from "@academy/courses-api/graphql/queries/cart"
import { getCourses } from "@academy/courses-api/graphql/queries/courses"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import { CartPage } from "@academy/user-ui/components/pages/cart-page"
import { loginHref } from "@academy/user-ui/lib/auth"
import type { AuthState } from "@academy/user-ui/types/api"
import { data, useNavigate } from "react-router"
import type { Route } from "./+types/cart"
import type { PostHogContext } from "../lib/posthog-middleware"

export async function loader({ params: { lang }, request }: Route.LoaderArgs) {
  const [cartPage, { courses }, cart, me, cardLabels] = await Promise.all([
    loadCartPage(lang),
    getCourses({ request, variables: {} }),
    getCart(request),
    getMe(request),
    loadCommonLabels(lang),
  ])
  if (!cartPage || !cart.cart) {
    throw new Response("Not Found", { status: 404 })
  }

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

  return { ...cartPage, courses, auth, cart, cardLabels }
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = String(formData.get("intent") ?? "create")
  const itemId = formData.get("itemId")
  const courseId = formData.get("courseId")
  const posthog = (context as PostHogContext).posthog

  if (intent === "removeFromCart") {
    if (typeof itemId !== "string") {
      throw new Response("Item ID is required", { status: 400 })
    }

    const variables: RemoveCartVariables = {
      itemId,
    }
    const { data: result, setCookies } = await removeCartMutation({
      request,
      variables,
    })

    try {
      posthog?.capture({
        event: "course_removed_from_cart",
        properties: { item_id: itemId },
      })
      const headers = new Headers()
      for (const c of setCookies) headers.append("Set-Cookie", c)
      return data(result, { headers })
    } catch (error) {
      return data(
        { ok: false, errors: { form: "No se pudo remover el articulo." } },
        { status: 500 }
      )
    }
  }

  if (intent === "addToCart") {
    if (typeof courseId !== "string" || courseId.length === 0) {
      throw new Response("Course ID is required", { status: 400 })
    }

    const variables: AddToCartVariables = {
      input: { itemId: courseId, quantity: 1 },
    }
    const { addToCart, setCookies } = await addToCartMutation({
      request,
      variables,
    })
    const headers = new Headers()
    for (const c of setCookies) headers.append("Set-Cookie", c)

    posthog?.capture({
      event: "course_added_to_cart",
      properties: { course_id: courseId },
    })

    // The mutation returns the full cart; the dialog only needs the line that
    // was just added — pick it out by the item id we submitted.
    const addedItem =
      addToCart.items.find((line) => line.itemId === courseId) ?? null
    return data<AddToCartResult["addToCart"]["items"][number] | null>(
      addedItem,
      {
        headers,
      }
    )
  }
}

export default function Cart({ params, loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()

  const { lang } = params

  const { courses, cart, auth } = loaderData

  const requireSession = (enroll: () => void) => () =>
    auth.status === "anonymous" ? navigate(loginHref(lang, "/cart")) : enroll()

  const recommendedCourses = courses.course.filter((course) =>
    cart.cart?.items.every((item) => item.itemId !== course.id)
  )

  return (
    <CartPage
      cardLabels={loaderData.cardLabels}
      cart={{
        ...cart.cart,
        createdAt: cart.cart?.createdAt ?? "",
        id: cart.cart?.id ?? "",
        updatedAt: cart.cart?.updatedAt ?? "",
        userId: cart.cart?.userId ?? "",
        items: cart.cart?.items as any,
        subtotal: cart.cart?.subtotal ?? 0,
        tax: cart.cart?.tax ?? 0,
        total: cart.cart?.total ?? 0,
        expiresAt: cart.cart?.expiresAt ?? "",
      }} // use mockEmptyCart to preview the empty state
      recommendedCourses={recommendedCourses?.slice(1, 4)}
      promo={{
        endsAt: '',
        bgColor: loaderData.announcementBgColor ?? "",
        showTimer: loaderData.announcementShowTimer ?? true,
        message: loaderData.announcementText ?? "",
      }}
      onCheckout={() => navigate(`/${lang}/checkout`)}
      onApplyCoupon={() => console.log("apply coupon")}
      pageLabels={{
        title: loaderData.title,
        emptyTitle: loaderData.emptyTitle ?? "",
        emptyDescription: loaderData.emptyDescription ?? "",
        emptyCta: loaderData.emptyCta ?? "",
        emptyCtaHref: loaderData.emptyCtaHref ?? "",
        itemCountLabel: loaderData.itemCountLabel ?? "",
        itemSaveLabel: loaderData.itemSaveLabel ?? "",
        itemRemoveLabel: loaderData.itemRemoveLabel ?? "",
        summaryTitle: loaderData.summaryTitle ?? "",
        summaryCurrentPrice: loaderData.summaryCurrentPrice ?? "",
        summaryOriginalPrice: loaderData.summaryOriginalPrice ?? "",
        summaryCheckoutCta: loaderData.summaryCheckoutCta ?? "",
        summaryCouponLabel: loaderData.summaryCouponLabel ?? "",
        summaryTotalToPayLabel: loaderData.summaryTotalToPayLabel ?? "",
        summaryCouponPlaceholder: loaderData.summaryCouponPlaceholder ?? "",
        ...loaderData.itemLabels,
        notChargedYetText: loaderData.notChargedYetText,
        freeIncludedSingular: loaderData.freeIncludedSingular,
        freeIncludedPlural: loaderData.freeIncludedPlural,
        freeCartTitle: loaderData.freeCartTitle,
        freeCartTextSingular: loaderData.freeCartTextSingular,
        freeCartTextPlural: loaderData.freeCartTextPlural,
        freeCartEnrollCta: loaderData.freeCartEnrollCta,
        freeCartStartNote: loaderData.freeCartStartNote,
        recommendationsTitle: loaderData.recommendationsTitle ?? "",
        recommendationsCta: loaderData.recommendationsCta ?? "",
        recommendationsCtaHref: loaderData.recommendationsCtaHref ?? "",
      }}
      requireSession={requireSession}
    />
  )
}
