import { loadCheckoutPage } from "@academy/cms/loaders/checkout"
import { checkoutMutation } from "@academy/courses-api/graphql/mutations/checkout"
import {
  getCart,
  type CartData,
} from "@academy/courses-api/graphql/queries/cart"
import { getMe } from "@academy/courses-api/graphql/queries/me"
import type { PaymentMethodOption } from "@academy/user-ui/components/checkout/checkout-components"
import { CheckoutPage } from "@academy/user-ui/components/pages/checkout-page"
import type { AuthState, CheckoutSummary } from "@academy/user-ui/types/api"
import { useEffect, useRef } from "react"
import { data, redirect, useFetcher, useNavigate } from "react-router"
import type { Route } from "./+types/checkout"
import type { PostHogContext } from "../lib/posthog-middleware"

import { STRIPE_PUBLISHABLE_KEY } from "../lib/stripe"

type Cart = NonNullable<CartData["cart"]>

/** Map the API cart onto the presentational summary shape. Amounts here are
 *  display-only — the charge is whatever the server puts on the PaymentIntent. */
function toCheckoutSummary(cart: Cart | null | undefined): CheckoutSummary {
  const lines = cart?.items ?? []
  const items = lines.map((line) => {
    const item = line.item as {
      title?: string | null
      planName?: string | null
      price?: number | null
      featuredImage?: string | null
    }
    const regular = item.price ?? line.unitPrice
    return {
      id: line.id,
      title: item.title ?? item.planName ?? "",
      price: { amount: line.unitPrice, currency: "MXN" as const },
      compareAtPrice:
        regular > line.unitPrice
          ? { amount: regular, currency: "MXN" as const }
          : undefined,
      imageUrl: item.featuredImage ?? undefined,
      imageTone: "yellow" as const,
    }
  })

  const total = cart?.total ?? 0
  const compareAtTotal = lines.reduce((acc, line) => {
    const item = line.item as {
      price?: number | null
      subtotalRegularPrice?: number | null
    }
    const regular = item.subtotalRegularPrice ?? item.price ?? line.unitPrice
    return acc + regular * (line.quantity ?? 1)
  }, 0)
  const discountPercent =
    compareAtTotal > total && compareAtTotal > 0
      ? Math.round((1 - total / compareAtTotal) * 100)
      : 0

  return {
    originalTotal: {
      amount: compareAtTotal || (cart?.subtotal ?? 0),
      currency: "MXN",
    },
    discountLabel: discountPercent > 0 ? `(un ${discountPercent} % menos)` : "",
    finalTotal: { amount: total, currency: "MXN" },
    itemCount: lines.length,
    items,
  }
}

export async function loader({ params: { lang }, request }: Route.LoaderArgs) {
  const [
    { checkoutLabels, summaryLabels, orderDetailsLabel, paymentLabels },
    cartData,
    me,
  ] = await Promise.all([
    loadCheckoutPage(lang),
    getCart(request),
    getMe(request),
  ])

  const cart = cartData.cart
  const summary = toCheckoutSummary(cart)

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

  if (auth.status === "anonymous") {
    return redirect(
      `/${lang}/login?redirect=${encodeURIComponent(`/${lang}/checkout`)}`
    )
  }

  return {
    checkoutLabels,
    summaryLabels,
    orderDetailsLabel,
    paymentLabels,
    summary,
    cartId: cart?.id ?? "",
    // Server-computed total is the source of truth for whether we charge.
    payable: (cart?.total ?? 0) > 0,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    customerEmail: me?.me?.email ?? undefined,
  }
}

/** Creates the Stripe PaymentIntent server-side via the existing checkout
 *  mutation and returns the `clientSecret` for Stripe Elements. */
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const cartId = String(formData.get("cartId") ?? "")
  if (!cartId) {
    return data({ error: "missingCartError" as const }, { status: 400 })
  }

  const posthog = (context as PostHogContext).posthog

  try {
    const { data: result, setCookies } = await checkoutMutation({
      request,
      variables: { cartId },
    })
    const headers = new Headers()
    for (const c of setCookies) headers.append("Set-Cookie", c)

    posthog?.capture({
      event: "checkout_started",
      properties: { cart_id: cartId, session_id: result?.checkout.id ?? null },
    })

    return data(
      {
        clientSecret: result?.checkout.clientSecret ?? null,
        // Authoritative session id — matches the transaction's stripe_session_id,
        // so the success page can look the order up.
        sessionId: result?.checkout.id ?? null,
      },
      { headers }
    )
  } catch (err) {
    // Log the real reason server-side; keep the UI message generic.
    console.error("[checkout] session creation failed:", err)
    return data({ error: "initErrorText" as const }, { status: 500 })
  }
}

export default function Checkout({ params, loaderData }: Route.ComponentProps) {
  const { lang } = params
  const {
    checkoutLabels,
    summaryLabels,
    orderDetailsLabel,
    summary,
    cartId,
    payable,
    publishableKey,
    customerEmail,
    paymentLabels,
  } = loaderData

  const navigate = useNavigate()
  const fetcher = useFetcher<typeof action>()

  // Create the Checkout Session once, as soon as we have a payable cart. The
  // ref guard makes this fire exactly once — React StrictMode (dev) re-runs
  // effects, and each call would mint a separate session + pending transaction.
  const sessionRequested = useRef(false)
  useEffect(() => {
    if (sessionRequested.current) return
    if (payable && cartId) {
      sessionRequested.current = true
      fetcher.submit({ cartId }, { method: "post" })
    }
  }, [payable, cartId, fetcher])

  const clientSecret =
    fetcher.data && "clientSecret" in fetcher.data
      ? fetcher.data.clientSecret
      : null
  const sessionId =
    fetcher.data && "sessionId" in fetcher.data ? fetcher.data.sessionId : null
  // Action returns an error CODE; map it to the CMS copy here.
  const initError =
    fetcher.data && "error" in fetcher.data
      ? (paymentLabels[fetcher.data.error] ?? paymentLabels.initErrorText)
      : null

  // Only card + OXXO are enabled for now. Re-enable the others when ready
  // (and make sure the backend PaymentIntent allows those payment methods).
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: "card",
      label: paymentLabels.cardMethodLabel,
      iconUrl: "/img/payments/cards.svg",
    },
    {
      id: "oxxo",
      label: paymentLabels.oxxoMethodLabel,
      iconUrl: "/img/payments/oxxo.svg",
    },
    // { id: "paypal", label: "PayPal", iconUrl: "/img/payments/paypal.svg" },
    // {
    //   id: "apple-pay",
    //   label: "Apple Pay",
    //   iconUrl: "/img/payments/apple-pay.svg",
    // },
    // {
    //   id: "google-pay",
    //   label: "Google Pay",
    //   iconUrl: "/img/payments/google-pay.svg",
    // },
    // {
    //   id: "mercado-pago",
    //   label: "Mercado Pago",
    //   iconUrl: "/img/payments/mercado-pago.svg",
    // },
  ]

  // Country names localize automatically via Intl — no CMS field needed.
  const regionNames = new Intl.DisplayNames([lang === "es" ? "es" : "en"], {
    type: "region",
  })
  const countries = ["MX", "CO", "AR", "CL", "PE"].map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
  }))

  return (
    <CheckoutPage
      summary={summary}
      countries={countries}
      paymentMethods={paymentMethods}
      onSubmit={(values) => console.log("checkout", values)}
      checkoutLabels={checkoutLabels}
      summaryLabels={summaryLabels}
      orderDetailsLabel={orderDetailsLabel}
      payable={payable}
      publishableKey={publishableKey}
      clientSecret={clientSecret}
      initializing={fetcher.state !== "idle"}
      initError={initError}
      customerEmail={customerEmail}
      paymentLabels={paymentLabels}
      onSuccess={() =>
        navigate(
          sessionId
            ? `/${lang}/checkout/success?session_id=${sessionId}`
            : `/${lang}/checkout/success`
        )
      }
    />
  )
}
