import { formatMoney } from "@academy/user-ui/types/api"
import type { CheckoutSummary } from "@academy/user-ui/types/api"
import { BrandButton } from "../brand/brand-button"
import {
  CheckoutForm,
  OrderDetails,
  OrderSummaryPanel,
} from "../checkout/checkout-components"
import type {
  CheckoutFormProps,
  OrderSummaryPanelProps,
  PaymentMethodOption,
} from "../checkout/checkout-components"
import {
  StripeElementsProvider,
  StripePaymentElement,
  StripePayButton,
} from "../checkout/stripe-checkout"

export interface CheckoutPageProps {
  summary: CheckoutSummary
  countries: Array<{ code: string; name: string }>
  paymentMethods: PaymentMethodOption[]
  onSubmit: CheckoutFormProps["onSubmit"]
  submitting?: boolean
  checkoutLabels: CheckoutFormProps["labels"]
  orderDetailsLabel: string | null
  summaryLabels: OrderSummaryPanelProps["labels"]
  /** Stripe integration — all optional so the page still renders standalone. */
  /** Whether the server-computed total is > 0. Free carts skip Stripe. */
  payable?: boolean
  publishableKey?: string
  /** PaymentIntent client secret from the `checkout` mutation. */
  clientSecret?: string | null
  /** True while the PaymentIntent is being created. */
  initializing?: boolean
  /** Error creating the session (before the card step). */
  initError?: string | null
  /** Buyer email, forwarded to Stripe confirm() (the session has none). */
  customerEmail?: string
  /** Called on confirmed payment or free enrollment to transition away. */
  onSuccess?: () => void
  /** Stripe-flow copy (CMS). `payCta` contains "{amount}". */
  paymentLabels: {
    payCta: string
    processingLabel: string
    preparingLabel: string
    loadingLabel: string
    paymentErrorText: string
    freeSubmitLabel: string
  }
}

/** Two-column checkout. Rendered inside a minimal checkout layout
 *  (logo + "Cancelar"), which lives in the app shell — not here. */
export function CheckoutPage({
  summary,
  countries,
  paymentMethods,
  onSubmit,
  submitting,
  checkoutLabels,
  orderDetailsLabel,
  summaryLabels,
  payable = false,
  publishableKey,
  clientSecret,
  initializing = false,
  initError,
  customerEmail,
  onSuccess,
  paymentLabels,
}: CheckoutPageProps) {
  const amountLabel = paymentLabels.payCta.replace(
    "{amount}",
    formatMoney(summary.finalTotal)
  )
  const stripeReady = Boolean(payable && publishableKey && clientSecret)

  const formProps = {
    countries,
    paymentMethods,
    onSubmit,
    submitting,
    labels: checkoutLabels,
  }

  let leftColumn: React.ReactNode

  if (!payable) {
    // Free / all-zero cart: enroll without Stripe.
    leftColumn = (
      <CheckoutForm
        {...formProps}
        submitSlot={
          <BrandButton
            variant="primary"
            size="lg"
            onClick={() => onSuccess?.()}
            disabled={submitting}
            className="self-start"
          >
            {submitting
              ? paymentLabels.processingLabel
              : paymentLabels.freeSubmitLabel}
          </BrandButton>
        }
      />
    )
  } else if (stripeReady) {
    leftColumn = (
      <StripeElementsProvider
        publishableKey={publishableKey!}
        clientSecret={clientSecret!}
      >
        <CheckoutForm
          {...formProps}
          cardSlot={<StripePaymentElement />}
          submitSlot={
            <StripePayButton
              label={amountLabel}
              processingLabel={paymentLabels.processingLabel}
              errorFallback={paymentLabels.paymentErrorText}
              email={customerEmail}
              onSuccess={() => onSuccess?.()}
            />
          }
        />
      </StripeElementsProvider>
    )
  } else {
    // Payable, but the PaymentIntent isn't ready yet.
    leftColumn = (
      <CheckoutForm
        {...formProps}
        cardSlot={
          initError ? (
            <p
              role="alert"
              className="text-sm font-semibold text-content-primary"
            >
              {initError}
            </p>
          ) : (
            <p className="text-sm text-content-muted">
              {initializing
                ? paymentLabels.preparingLabel
                : paymentLabels.loadingLabel}
            </p>
          )
        }
        submitSlot={
          <BrandButton
            variant="primary"
            size="lg"
            disabled
            className="self-start"
          >
            {amountLabel}
          </BrandButton>
        }
      />
    )
  }

  return (
    <main className="grid min-h-svh bg-surface-page lg:grid-cols-[1.1fr_1fr]">
      <div className="px-page-x py-stack-lg lg:border-r-2 lg:border-border-strong lg:py-16">
        <div className="mx-auto flex max-w-lg flex-col gap-stack-lg">
          {leftColumn}
          <OrderDetails
            summary={summary}
            labels={{
              orderDetailsLabel,
            }}
            className="border-t border-border-subtle pt-stack-lg"
          />
        </div>
      </div>

      <OrderSummaryPanel summary={summary} labels={summaryLabels} />
    </main>
  )
}
