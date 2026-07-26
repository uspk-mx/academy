import { CourseBySlugData } from "@academy/courses-api/graphql/queries/course"
import { cn } from "@academy/user-ui/lib/utils"
import {
  compareAtPrice,
  CourseBadge,
  courseTone,
  discountPercent,
  effectivePrice,
  formatDuration,
  formatPrice,
  isNewCourse,
} from "@academy/user-ui/types/api"
import { BrandTone } from "@academy/user-ui/types/cms"
import {
  IconArrowRight,
  IconClock,
  IconPlayerPlay,
  IconPlus,
} from "@tabler/icons-react"
import { Link, useParams } from "react-router"
import { BrandButton } from "../brand/brand-button"
import {
  HardCard,
  Pill,
  PriceTag,
  RatingStars,
  toneSoftBg,
} from "../brand/primitives"

const cleanLabel = (label: string) => label.replace(/[.\s]+$/, "")

export interface CourseCardLabels {
  freeLabel: string
  customPriceLabel: string
  addToCartLabel: string
  enrollFreeLabel: string
  newBadgeLabel: string
}

/** Fallback copy — overridable per call site. TODO(hygraph): thread these from
 *  a shared CommonLabels model instead of relying on the fallback. */
export const defaultCourseCardLabels: CourseCardLabels = {
  freeLabel: "Gratis",
  customPriceLabel: "Precio a medida",
  addToCartLabel: "Añadir al carrito",
  enrollFreeLabel: "Inscribirme gratis",
  newBadgeLabel: "Nuevo",
}

export interface CourseCardProps {
  course: CourseBySlugData["courseBySlug"]
  /** "catalog" — price row links to detail (Cursos, "también compran").
   *  "commerce" — buy button + "Añadir al carrito" link (cart cross-sell). */
  variant?: "catalog" | "commerce"
  onAddToCart?: (courseId: string) => void
  /** Free courses enroll directly instead of going through the cart. */
  onEnrollFree?: (courseId: string) => void
  className?: string
  labels?: CourseCardLabels
}

export function CourseCard({
  course,
  variant = "catalog",
  onAddToCart,
  onEnrollFree,
  className,
  labels = defaultCourseCardLabels,
}: CourseCardProps) {
  const { lang } = useParams()
  const detailHref = `/${lang}/courses/${course.slug}`
  const tone = courseTone(course)
  const isFree = course.pricingType === "FREE"
  const isCustom = course.pricingType === "CUSTOM"
  const current = effectivePrice(course)
  const compareAt = compareAtPrice(course)
  const discount = discountPercent(course)
  /** "Nuevo" is derived from publishedAt; otherwise the first tag, truncated. */
  const tagLabel = isNewCourse(course) ? labels.newBadgeLabel : course.tags?.[0]

  const lessonCount = course.topics?.flatMap((item) => {
    item.lessons
  }).length

  const showMeta = course.duration > 0 || (lessonCount ?? 0) > 0

  return (
    <div className={cn("flex h-full flex-1 flex-col gap-2", className)}>
      <HardCard
        as="article"
        className="group relative flex h-full flex-col overflow-hidden transition-[translate,box-shadow] duration-200 ease-academy hover:-translate-y-1 hover:shadow-hard-md"
      >
        <div
          className={cn(
            "relative border-b-2 border-border-strong px-card-sm pt-card-sm pb-5",
            toneSoftBg[tone]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            {tagLabel ? (
              <Pill tone="coral" className="min-w-0">
                <span className="truncate">{cleanLabel(tagLabel)}</span>
              </Pill>
            ) : (
              <span />
            )}
            {course.level && (
              <Pill className="shrink-0 whitespace-nowrap">
                {course.level.name}
              </Pill>
            )}
          </div>
          <div className="mt-3 flex justify-center">
            <div className="w-[82%] -rotate-2 rounded-card border-2 border-border-strong bg-surface-card p-1 shadow-hard-xs transition-transform duration-200 ease-academy group-hover:rotate-0">
              {course.featuredImage ? (
                <img
                  src={course.featuredImage}
                  alt=""
                  loading="lazy"
                  className="aspect-16/10 w-full rounded-[calc(var(--radius-card)-6px)] object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className={cn(
                    "flex aspect-16/10 w-full items-center justify-center rounded-[calc(var(--radius-card)-6px)]",
                    toneSoftBg[tone]
                  )}
                >
                  <span className="font-heading text-3xl font-medium italic">
                    {course.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-stack p-card-sm">
          <div>
            {course.category && (
              <p className="text-label font-semibold tracking-tight-brand text-content-muted uppercase">
                {cleanLabel(course.category.name)}
              </p>
            )}
            <h3 className="mt-1 text-card-title leading-snug font-bold tracking-tight-brand">
              <Link
                to={detailHref}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {course.title}
              </Link>
            </h3>
          </div>

          {course.reviews?.map(
            (item) =>
              item.rating != null && <RatingStars rating={item.rating} />
          )}

          {showMeta && (
            <p className="flex items-center gap-4 text-sm text-content-muted">
              {course.duration > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <IconClock aria-hidden className="size-4" />
                  {formatDuration(course.duration)}
                </span>
              )}
              {(lessonCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <IconPlayerPlay aria-hidden className="size-4 fill-current" />
                  {lessonCount} lec.
                </span>
              )}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
            {isFree ? (
              variant === "commerce" && onEnrollFree ? (
                <div className="relative z-10 flex flex-1 flex-wrap items-center justify-between gap-2">
                  <BrandButton
                    variant="primary"
                    size="sm"
                    onClick={() => onEnrollFree(course.id)}
                  >
                    {labels.enrollFreeLabel}
                  </BrandButton>
                  <span className="text-sm font-bold text-academy-green">
                    {labels.freeLabel}
                  </span>
                </div>
              ) : (
                <p className="text-lg font-bold text-academy-green">{labels.freeLabel}</p>
              )
            ) : isCustom ? (
              <p className="text-sm font-bold">{labels.customPriceLabel}</p>
            ) : variant === "catalog" ? (
              <PriceTag
                price={current}
                compareAtPrice={compareAt}
                discountPercent={discount}
                className="flex-1"
              />
            ) : (
              <div className="relative z-10 flex flex-1 flex-wrap items-center justify-between gap-2">
                <BrandButton variant="secondary" size="sm" to={detailHref}>
                  Comprar {formatPrice(current)}
                </BrandButton>
                <span className="text-right">
                  {discount != null && (
                    <span className="block text-label font-bold text-academy-coral">
                      -{discount}%
                    </span>
                  )}
                  {compareAt != null && (
                    <s className="text-sm font-semibold text-content-muted">
                      {formatPrice(compareAt)}
                    </s>
                  )}
                </span>
              </div>
            )}

            {/* Click affordance — slides on hover */}
            {variant === "catalog" && (
              <IconArrowRight
                aria-hidden
                className="size-4 shrink-0 text-content-muted transition-transform duration-200 ease-academy group-hover:translate-x-1 group-hover:text-content-primary"
              />
            )}
          </div>
        </div>
      </HardCard>

      {variant === "commerce" && onAddToCart && !isFree && !isCustom && (
        <button
          type="button"
          onClick={() => onAddToCart(course.id)}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-academy-coral underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          <IconPlus aria-hidden className="size-4" strokeWidth={2.5} />
          {labels.addToCartLabel}
        </button>
      )}
    </div>
  )
}

export interface CourseGridProps {
  courses: CourseBySlugData["courseBySlug"][]
  variant?: CourseCardProps["variant"]
  onAddToCart?: (courseId: string) => void
  onEnrollFree?: (courseId: string) => void
  columns?: 2 | 3
  className?: string
  labels?: CourseCardLabels
}

export function CourseGrid({
  courses,
  variant,
  onAddToCart,
  onEnrollFree,
  columns = 3,
  className,
  labels,
}: CourseGridProps) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-stack-lg sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
    >
      {courses.map((course) => (
        <li key={course.id} className="relative">
          <CourseCard
            course={course}
            variant={variant}
            labels={labels}
            onAddToCart={onAddToCart}
            onEnrollFree={onEnrollFree}
          />
        </li>
      ))}
    </ul>
  )
}
