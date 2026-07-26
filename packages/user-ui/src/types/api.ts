/**
 * API-driven data types (Go/GraphQL backend).
 * Courses, pricing, auth/user state, cart and enrollment.
 */

import type { CourseBySlugData } from "@academy/courses-api/graphql/queries/course"
import type { BrandTone } from "./cms"

export type PricingType = "FREE" | "PAID" | "CUSTOM"
export type CourseStatus = "PUBLISHED" | "DRAFT" | "IN_PAUSE"
export type CourseVisibility = "PUBLIC" | "PASSWORD_PROTECTED" | "PRIVATE"

export interface CourseCategory {
  id: string
  name: string
}

export interface CourseLevel {
  id: string
  name: string
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export type CourseBadge = "new" | "popular" | "bestseller" | "pro"

export interface Money {
  /** Minor units are avoided on purpose — prices are whole MXN. */
  amount: number
  currency: "MXN"
}

export interface Instructor {
  id: string
  name: string
  credentials?: string // "Profesora certificada · British Council"
  avatarUrl?: string
}

export interface CourseSummary {
  id: string
  slug: string
  title: string // "Inglés desde cero – Parte 1"
  levelCode: CefrLevel
  /** Full internal level label shown as the card eyebrow, e.g. "Inglés Nivel A1 a". */
  levelLabel: string
  specialty: "general" | "gastronomia" | "enfermeria" | "negocios"
  rating: number // 4.9
  ratingCount: number
  durationMinutes: number
  lessonCount: number
  price: Money
  compareAtPrice?: Money
  discountPercent?: number
  badge?: CourseBadge
  /** Character/illustration tile. */
  imageUrl?: string
  imageTone: "yellow" | "blue" | "green" | "coral"
}

type Course = CourseBySlugData["courseBySlug"]

/**
 * Detail page adds PDF sections still pending an API/CMS source.
 * Everything optional — sections hide when absent.
 */
export interface CourseDetail extends Course {
  subtitle?: string // "PEOPLE AND OCCUPATIONS"
  instructor?: Instructor
  learningOutcomes?: string[]
  includes?: string[]
  previewUrl?: string
  /** ISO datetime — derive server-side from publishedAt + promotionDuration. */
  offerEndsAt?: string
  guaranteeLabel?: string // "Garantía 30 días"
}

/* ---------------------------------- Auth ---------------------------------- */

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export type AuthState =
  { status: "anonymous" } | { status: "authenticated"; user: User }

export type EnrollmentStatus = "none" | "enrolled" | "completed"

/* ---------------------------------- Cart ---------------------------------- */

export interface CourseReview {
  id: string
  likes: number | null
  rating: number | null
  comment: string | null
}

export interface CourseEnrollment {
  id: string
  status: string
  user: { id: string; fullName: string; email: string }
}

/** Course fragment exactly as selected in the Cart query — standalone on
 *  purpose: the query selection is its own contract, independent from the
 *  catalog `Course` model. Discriminated by __typename: request it! */
export interface CartCourse {
  __typename: "Course"
  id: string
  title: string
  price: number
  featuredImage: string | null
  enrollments: CourseEnrollment[] | null
  tags: string[] | null
  status: CourseStatus | null
  slug: string | null
  shortDescription: string | null
  reviews: CourseReview[] | null
  discountedPrice: number | null
  category: CourseCategory | null
  level: CourseLevel | null
  pricingType: PricingType | null
}

export interface CartBundle {
  __typename: "CourseBundle"
  id: string
  title: string
  price: number
  /** Sum of the bundled courses at regular price — the struck-through figure. */
  subtotalRegularPrice: number | null
  featuredImage: string
  discountValue: number | null
  discountType: "PERCENTAGE" | "FIXED" | null
}

export interface CartSubscriptionPlan {
  __typename: "SubscriptionPlan"
  id: string
  planName: string
  price: number
  /** Plan length as returned by the API (unit defined server-side). */
  duration: number
  stripePricePlanID: string
}

export type CartLineItem = CartCourse | CartBundle | CartSubscriptionPlan

export interface CartLine {
  id: string
  cartId: string
  itemId: string
  /** Server enum mirror — for rendering, discriminate on item.__typename. */
  itemType: string
  inStock: boolean
  notes: string | null
  quantity: number
  /** Price snapshot at add-to-cart time — the authoritative charged price. */
  unitPrice: number
  item: CartLineItem
}

export interface Cart {
  id: string
  userId: string | null
  items: CartLine[]
  /** Server-computed — never re-derive client-side. */
  subtotal: number
  tax: number
  total: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

/* -------------------------------- Checkout -------------------------------- */

export type PaymentMethodId =
  "card" | "paypal" | "apple-pay" | "google-pay" | "oxxo" | "mercado-pago"

export interface CheckoutSummary {
  originalTotal: Money
  discountLabel: string // "(un 45 % menos)"
  finalTotal: Money
  itemCount: number
  items: Array<{
    id: string
    title: string
    subtitle?: string
    price: Money
    compareAtPrice?: Money
    imageUrl?: string
    imageTone: BrandTone
  }>
}

/* --------------------------------- Helpers -------------------------------- */

export function formatMoney(money: Money): string {
  return `$${money.amount.toLocaleString("es-MX")} MX`
}

// Implementations live in lib/format (no API types) so sibling UI packages can
// import them without pulling in this module's GraphQL type graph.
export { formatDuration, formatPrice } from "../lib/format"

type Priceable = Pick<Course, "pricingType" | "discountedPrice" | "price">

/** Price the buyer pays right now. */
export function effectivePrice(course: Priceable): number {
  if (course.pricingType === "FREE") return 0
  return course.discountedPrice ?? course.price
}

/** Original price to strike through, when there's an active discount. */
export function compareAtPrice(course: Priceable): number | undefined {
  return course.discountedPrice != null && course.discountedPrice < course.price
    ? course.price
    : undefined
}

export function discountPercent(course: Priceable): number | undefined {
  const compareAt = compareAtPrice(course)
  if (compareAt == null || compareAt === 0) return undefined
  return Math.round((1 - effectivePrice(course) / compareAt) * 100)
}

/** Published within the last `days` — drives the "Nuevo" pill. */
export function isNewCourse(course: Course, days = 30): boolean {
  if (!course.publishedAt) return false
  const age = Date.now() - new Date(course.publishedAt).getTime()
  return age >= 0 && age < days * 24 * 60 * 60 * 1000
}

/** Free lines never charge — courses flagged FREE or a 0 unit price. */
export function isFreeCartLine(line: CartLine): boolean {
  if (line.item.__typename === "Course" && line.item.pricingType === "FREE") return true;
  return line.unitPrice === 0;
}

export type CartMode = "empty" | "free" | "paid" | "mixed";

/** Drives the cart/checkout UX: all-free carts are an enrollment, not a purchase. */
export function cartMode(cart: Cart): CartMode {
  if (cart.items.length === 0) return "empty";
  const freeCount = cart.items.filter(isFreeCartLine).length;
  if (freeCount === 0) return "paid";
  return freeCount === cart.items.length ? "free" : "mixed";
}
 

/** Average rating + count derived from cart course reviews. */
export function averageRating(
  reviews: CourseReview[] | null | undefined
): { rating: number; count: number } | undefined {
  const rated = reviews?.filter((r) => r.rating != null) ?? []
  if (rated.length === 0) return undefined
  const sum = rated.reduce((acc, r) => acc + (r.rating ?? 0), 0)
  return { rating: sum / rated.length, count: rated.length }
}

/**
 * "Antes / -X%" figures for the cart summary, derived from the lines'
 * regular prices vs the server-computed subtotal.
 */
export function cartSavings(
  cart: Cart
): { compareAtTotal: number; discountPercent: number } | undefined {
  const compareAtTotal = cart.items.reduce((acc, line) => {
    const regular =
      line.item.__typename === "CourseBundle"
        ? (line.item.subtotalRegularPrice ?? line.unitPrice)
        : line.item.__typename === "Course"
          ? Math.max(line.item.price, line.unitPrice)
          : line.unitPrice
    return acc + regular * line.quantity
  }, 0)
  if (compareAtTotal <= cart.subtotal) return undefined
  return {
    compareAtTotal,
    discountPercent: Math.round((1 - cart.subtotal / compareAtTotal) * 100),
  }
}

const tones: BrandTone[] = ["yellow", "blue", "green", "coral"]

/**
 * Deterministic tone for the skewed image tile, derived from the category
 * (falls back to id) so cards vary consistently without an API field.
 */
export function courseTone(course: Pick<Course, "id" | "category">): BrandTone {
  const key = course.category?.name ?? course.id
  let hash = 0
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  return tones[Math.abs(hash) % tones.length]
}
