import { cn } from "@academy/user-ui/lib/utils"
import {
  CheckoutSummary,
  formatMoney,
  PaymentMethodId,
} from "@academy/user-ui/types/api"
import { IconGlobe, IconLock } from "@tabler/icons-react"
import { useState, type ReactNode } from "react"
import { BrandButton } from "../brand/brand-button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Link } from "react-router"
import { toneBg } from "../brand/primitives"

export interface PaymentMethodOption {
  id: PaymentMethodId
  label: string
  iconUrl?: string
}

export interface CardFormValues {
  number: string
  expiry: string
  cvc: string
  name: string
  saveCard: boolean
}

export interface CheckoutFormProps {
  countries: Array<{ code: string; name: string }>
  paymentMethods: PaymentMethodOption[]
  defaultCountry?: string
  onSubmit: (values: {
    country: string
    method: PaymentMethodId
    card?: CardFormValues
  }) => void
  submitting?: boolean
  className?: string
  /** When set (Stripe integration), replaces the hand-rolled card inputs for
   *  the "card" method — e.g. Stripe's <PaymentElement />. */
  cardSlot?: ReactNode
  /** When set, replaces the built-in submit button — e.g. a Stripe pay button
   *  that must live inside <Elements> to confirm the payment. */
  submitSlot?: ReactNode
  labels: {
    pageTitle: string | null
    cancelLabel: string | null
    cancelHref: string | null
    billingTitle: string | null
    billingCountryLabel: string | null
    billingLegalText: string | null
    paymentTitle: string | null
    paymentSecureLabel: string | null
    submitLabel: string | null
    submittingLabel: string | null
  }
}

export function CheckoutForm({
  countries,
  paymentMethods,
  defaultCountry = "MX",
  onSubmit,
  submitting = false,
  className,
  labels,
  cardSlot,
  submitSlot,
}: CheckoutFormProps) {
  const [country, setCountry] = useState(defaultCountry)
  const [method, setMethod] = useState<PaymentMethodId>("card")
  const [card, setCard] = useState<CardFormValues>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    saveCard: false,
  })

  function handleSubmit() {
    onSubmit({ country, method, card: method === "card" ? card : undefined })
  }

  return (
    <div className={cn("flex flex-col gap-stack-lg", className)}>
      <h1 className="text-section-title leading-display font-bold tracking-display">
        {labels.pageTitle}
      </h1>

      <section aria-labelledby="billing-heading">
        <h2
          id="billing-heading"
          className="text-card-title font-bold tracking-tight-brand"
        >
          {labels.billingTitle}
        </h2>
        <div className="mt-stack max-w-xs">
          <Label htmlFor="country" className="text-sm font-bold">
            {labels.billingCountryLabel}
          </Label>
          <div className="relative mt-1.5">
            <IconGlobe
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
            />
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full appearance-none rounded-button border-2 border-border-strong bg-surface-card py-2 pr-8 pl-9 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-stack max-w-md text-label leading-body text-content-muted">
          {labels.billingLegalText}
        </p>
      </section>

      <section aria-labelledby="payment-heading">
        <div className="flex items-center justify-between">
          <h2
            id="payment-heading"
            className="text-card-title font-bold tracking-tight-brand"
          >
            {labels.paymentTitle}
          </h2>
          <p className="inline-flex items-center gap-1 text-label font-semibold underline underline-offset-4">
            {labels.paymentSecureLabel}{" "}
            <IconLock aria-hidden className="size-3.5" />
          </p>
        </div>

        {/* <RadioGroup
          value={method}
          onValueChange={(value) => setMethod(value as PaymentMethodId)}
          className="mt-stack gap-0 overflow-hidden rounded-card border-2 border-border-strong"
        >
          {paymentMethods.map((option, index) => {
            const selected = method === option.id
            return (
              <div
                key={option.id}
                className={cn(
                  index > 0 && "border-t-2 border-border-strong",
                  selected ? "bg-surface-card" : "bg-surface-muted"
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <RadioGroupItem
                    id={`pay-${option.id}`}
                    value={option.id}
                    className="border-2 border-border-strong"
                  />
                  {option.iconUrl && (
                    <img src={option.iconUrl} alt="" className="h-5 w-auto" />
                  )}
                  <Label
                    htmlFor={`pay-${option.id}`}
                    className="flex-1 text-sm font-bold"
                  >
                    {option.label}
                  </Label>
                </div>

                {option.id === "card" && selected && cardSlot && (
                  <div className="border-t-2 border-border-strong p-card-sm">
                    {cardSlot}
                  </div>
                )}

                {option.id === "card" && selected && !cardSlot && (
                  <div className="grid gap-stack border-t-2 border-border-strong p-card-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="card-number" className="text-sm">
                        {labels.cardNumberLabel}
                      </Label>
                      <Input
                        id="card-number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={(e) =>
                          setCard({ ...card, number: e.target.value })
                        }
                        className="mt-1.5 border-border-subtle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-expiry" className="text-sm">
                        {labels.cardExpiryLabel}
                      </Label>
                      <Input
                        id="card-expiry"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        value={card.expiry}
                        onChange={(e) =>
                          setCard({ ...card, expiry: e.target.value })
                        }
                        className="mt-1.5 border-border-subtle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvc" className="text-sm">
                        {labels.cardCvcLabel}
                      </Label>
                      <Input
                        id="card-cvc"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="CVV"
                        value={card.cvc}
                        onChange={(e) =>
                          setCard({ ...card, cvc: e.target.value })
                        }
                        className="mt-1.5 border-border-subtle"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="card-name" className="text-sm">
                        {labels.cardNameLabel}
                      </Label>
                      <Input
                        id="card-name"
                        autoComplete="cc-name"
                        placeholder="Nombre en la tarjeta"
                        value={card.name}
                        onChange={(e) =>
                          setCard({ ...card, name: e.target.value })
                        }
                        className="mt-1.5 border-border-subtle"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Checkbox
                        id="save-card"
                        checked={card.saveCard}
                        onCheckedChange={(state) =>
                          setCard({ ...card, saveCard: state === true })
                        }
                      />
                      <Label
                        htmlFor="save-card"
                        className="text-label font-medium"
                      >
                        Guardar esta tarjeta de forma segura para comprar más
                        adelante
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </RadioGroup> */}

        {cardSlot && (
          <div className="mt-4 border-t-2 border-border-strong pt-4">
            {cardSlot}
          </div>
        )}
      </section>

      {submitSlot ?? (
        <BrandButton
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
          className="self-start"
        >
          {submitting ? labels.submittingLabel : labels.submitLabel}
        </BrandButton>
      )}
    </div>
  )
}

export function OrderDetails({
  summary,
  labels,
  className,
}: {
  summary: CheckoutSummary
  className?: string
  labels: {
    orderDetailsLabel: string | null
  }
}) {
  return (
    <section aria-labelledby="order-details-heading" className={className}>
      <h2 id="order-details-heading" className="text-sm font-bold">
        {labels.orderDetailsLabel} ({summary.itemCount}{" "}
        {summary.itemCount === 1 ? "curso" : "cursos"})
      </h2>
      <ul className="mt-stack flex flex-col gap-stack">
        {summary.items.map((item) => (
          <li key={item.id} className="flex items-center gap-stack">
            <div
              className={cn(
                "flex h-16 w-14 shrink-0 -skew-x-6 items-end justify-center overflow-hidden rounded-card border-2 border-border-strong",
                toneBg[item.imageTone]
              )}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full scale-110 skew-x-6 object-contain object-bottom"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-bold">{item.title}</p>
              {item.subtitle && (
                <p className="font-semibold">{item.subtitle}</p>
              )}
            </div>
            <p className="text-right text-sm">
              <span className="block font-bold">{formatMoney(item.price)}</span>
              {item.compareAtPrice && (
                <s className="text-content-muted">
                  {formatMoney(item.compareAtPrice)}
                </s>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export interface OrderSummaryPanelProps {
  summary: CheckoutSummary
  className?: string
  labels: {
    summaryTitle: string | null
    summaryOriginalPrice: string | null
    summaryDiscount: string | null
    summaryFinalPrice: string | null
    summaryTotal: string | null
    summaryTermsText: string | null
    summaryTermsLabel: string | null
    summaryTermsHref: string | null
    guaranteeTitle: string | null
    guaranteeDescription: string | null
    socialProofTitle: string | null
    socialProofText: string | null
  }
}

/** Yellow right-hand column of the checkout page. */
export function OrderSummaryPanel({
  summary,
  className,
  labels,
}: OrderSummaryPanelProps) {
  return (
    <aside
      aria-labelledby="order-summary-heading"
      className={cn(
        "bg-academy-yellow-soft px-page-x py-stack-lg lg:py-16",
        className
      )}
    >
      <div className="mx-auto flex max-w-md flex-col gap-stack-lg">
        <h2
          id="order-summary-heading"
          className="text-card-title font-bold tracking-tight-brand"
        >
          {labels.summaryTitle}
        </h2>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>{labels.summaryOriginalPrice}</dt>
            <dd>{formatMoney(summary.originalTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{labels.summaryDiscount}</dt>
            <dd>{summary.discountLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{labels.summaryFinalPrice}</dt>
            <dd>{formatMoney(summary.finalTotal)}</dd>
          </div>
          <div className="mt-stack flex justify-between border-t-2 border-border-strong pt-stack text-base font-bold">
            <dt>
              {labels.summaryTotal} ({summary.itemCount}{" "}
              {summary.itemCount === 1 ? "curso" : "cursos"}):
            </dt>
            <dd>{formatMoney(summary.finalTotal)}</dd>
          </div>
        </dl>

        <p className="text-sm">
          {labels.summaryTermsText}{" "}
          <Link
            to={labels.summaryTermsHref ?? ""}
            className="font-semibold text-academy-blue underline"
          >
            {labels.summaryTermsLabel}
          </Link>
          .
        </p>

        <div className="text-center">
          <h3 className="text-card-title font-bold tracking-tight-brand">
            {labels.guaranteeTitle}
          </h3>
          <p className="mt-stack text-sm leading-body">
            {labels.guaranteeDescription}
          </p>
        </div>

        {labels.socialProofTitle && (
          <div className="mx-auto max-w-72 rounded-card border-2 border-border-strong bg-surface-page p-card text-center shadow-hard-xs">
            <h3 className="text-sm font-bold">{labels.socialProofTitle}</h3>
            <p className="mt-stack text-sm leading-body">
              {labels.socialProofText}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
