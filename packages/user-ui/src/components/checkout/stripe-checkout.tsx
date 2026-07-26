import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout"
import { loadStripe, type Stripe, type Appearance } from "@stripe/stripe-js"
import { useMemo, useState, type ReactNode } from "react"
import { BrandButton } from "../brand/brand-button"

/**
 * Stripe glue for the custom checkout. The backend `checkout` mutation creates a
 * Stripe Checkout Session (ui_mode: custom) and returns its `clientSecret`; here
 * we mount the Payment Element against that session and confirm it. Amounts and
 * line items are owned by the server — nothing is trusted from the client.
 *
 * Uses the `@stripe/react-stripe-js/checkout` bindings (Custom Checkout), not
 * the PaymentIntent `<Elements>` flow.
 */

/** `loadStripe` must run once per publishable key, outside React render. */
const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripe(publishableKey: string): Promise<Stripe | null> {
  let promise = stripeCache.get(publishableKey)
  if (!promise) {
    promise = loadStripe(publishableKey)
    stripeCache.set(publishableKey, promise)
  }
  return promise
}

/** Stripe Elements (rendered in an iframe) can't read our Tailwind tokens,
 *  so the design system is mirrored here as explicit values. */
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#5F6FFF", // --academy-blue
    colorBackground: "#FFFFFF", // --surface-card
    colorText: "#000000", // --content-primary
    colorTextSecondary: "#6B6863", // --content-muted
    colorTextPlaceholder: "#6B6863",
    colorDanger: "#DC2626",
    fontFamily: "'DM Sans', sans-serif",
    fontSizeBase: "14px",
    borderRadius: "0.625rem", // --radius-button
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "2px solid #000000", // --border-strong
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      outline: "2px solid #5F6FFF",
      outlineOffset: "2px",
      border: "2px solid #000000",
    },
    ".Label": {
      fontWeight: "700",
      marginBottom: "6px",
    },
    ".Tab, .AccordionItem, .Block": {
      border: "2px solid #000000",
      boxShadow: "none",
    },
  },
}

export interface StripeElementsProviderProps {
  publishableKey: string
  /** Checkout Session client secret from the `checkout` mutation. */
  clientSecret: string
  children: ReactNode
}

/** Wraps its subtree in the Custom Checkout context. Anything rendered inside —
 *  including slots passed in as props — can use the checkout hooks. */
export function StripeElementsProvider({
  publishableKey,
  clientSecret,
  children,
}: StripeElementsProviderProps) {
  const stripePromise = useMemo(
    () => getStripe(publishableKey),
    [publishableKey]
  )
  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret, elementsOptions: { appearance } }}
    >
      {children}
    </CheckoutElementsProvider>
  )
}

/** The Payment Element for the current checkout session. Slotted into
 *  <CheckoutForm> in place of the hand-rolled card inputs. */
export function StripePaymentElement() {
  return <PaymentElement options={{ layout: "tabs" }} />
}

export interface StripePayButtonProps {
  /** Localized label, e.g. "Pagar $399 MX". */
  label: string
  processingLabel: string
  /** Buyer email — the session has none, so confirm() requires it. */
  email?: string
  /** Called after confirm() resolves inline (the session id is known by the
   *  route from the checkout mutation, so none is passed here). */
  onSuccess: () => void
  errorFallback: string
}

/** Rendered *inside* <StripeElementsProvider> so the checkout hook resolves.
 *  Owns the confirm call plus its processing/error state, and stays disabled
 *  until the session is ready and whenever a confirm is in flight. */
export function StripePayButton({
  label,
  processingLabel,
  email,
  onSuccess,
  errorFallback,
}: StripePayButtonProps) {
  const result = useCheckoutElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    if (result.type !== "success") return
    setProcessing(true)
    setError(null)

    // The session carries its own `return_url` (set server-side), so confirm()
    // must NOT be given one — but it has no email, so we pass the buyer's.
    // Keep the SPA flow; Stripe only redirects when required (OXXO/3DS).
    const confirmResult = await result.checkout.confirm({
      email,
      redirect: "if_required",
    })

    if (confirmResult.type === "error") {
      setError(confirmResult.error.message ?? errorFallback)
      setProcessing(false)
      return
    }

    onSuccess()
  }

  const ready = result.type === "success"

  return (
    <div className="flex flex-col gap-stack">
      {error && (
        <p
          role="alert"
          className="rounded-button border-2 border-border-strong bg-academy-yellow-soft px-4 py-2 text-sm font-semibold text-content-primary"
        >
          {error}
        </p>
      )}
      <BrandButton
        variant="primary"
        size="lg"
        onClick={handlePay}
        disabled={!ready || processing}
        className="self-start"
      >
        {processing ? processingLabel : label}
      </BrandButton>
    </div>
  )
}
