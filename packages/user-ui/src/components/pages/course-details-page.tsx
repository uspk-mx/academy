import type { CourseBySlugData } from "@academy/courses-api/graphql/queries/course"
import { formatDuration } from "@academy/user-ui/types/api"
import type {
  AuthState,
  CartLine,
  CourseDetail,
  EnrollmentStatus,
} from "@academy/user-ui/types/api"
import {
  IconCheck,
  IconChevronRight,
  IconClock,
  IconPlayerPlay,
  IconUsers,
} from "@tabler/icons-react"
import { Link, useParams } from "react-router"
import { HardCard, Pill, RatingStars } from "../brand/primitives"
import { CourseGrid, type CourseCardLabels } from "../course/course-card"
import { PurchaseCard, type PurchaseCardLabels } from "../course/purchase-card"
import type { CartData } from "@academy/courses-api/graphql/queries/cart"
import {
  ItemAddedToCartDialog,
  type CartItemRowLabels,
} from "../cart/item-added-to-cart-dialog"
import { useState } from "react"
import { EnrollmentConfirmationDialog } from "../cart/enrollment-confirmation-dialog"
import type { CreateEnrollmentResult } from "@academy/courses-api/graphql/mutations/enrollments"

/** CMS copy for this page; matches the future Hygraph CourseDetailsPage model. */
export interface CourseDetailsPageLabels {
  breadcrumbHome: string
  breadcrumbCourses: string
  levelPrefix: string
  studentsLabel: string
  lessonsLabel: string
  learnTitle: string
  learnEmptyText: string
  descriptionTitle: string
  requirementsTitle: string
  relatedTitle: string
  relatedSubtitle: string
  purchase: PurchaseCardLabels
  cardLabels?: CourseCardLabels
  dialogs: {
    addedToCartTitle: string
    boughtTogetherTitle: string
    enrolledTitle: string
    goToCartCta: string
    goToCoursesCta: string
    keepShoppingCta: string
  }
  cartItem: CartItemRowLabels
}

export interface CourseDetailPageProps {
  course: CourseDetail
  relatedCourses: CourseBySlugData["courseBySlug"][]
  auth: AuthState
  enrollment: EnrollmentStatus
  onEnrollFree: (courseId: string) => void
  onBuyNow: (courseId: string) => void
  onAddToCart: (courseId: string) => void
  cart: CartData | null
  addedItem?: CartLine
  enrolledCourse?: CreateEnrollmentResult
  isAddingItem?: boolean
  labels: CourseDetailsPageLabels
}

/**
 * Splits real course titles for the hero treatment:
 * "Inglés desde cero – Parte 1"                → main + accent "Parte 1"
 * "Ingles para Enfermeria: Vocabulario A1"     → main + accent after the colon
 * Anything else                                → main only, no accent line.
 */
function parseCourseTitle(title: string): { main: string; accent?: string } {
  const parte = title.match(/^(.*?)[\s:–—-]*\b(Parte\s*\d+)\s*$/i)
  if (parte) return { main: parte[1].trim(), accent: parte[2] }
  const colon = title.indexOf(":")
  if (colon > 0 && colon < title.length - 1) {
    return {
      main: title.slice(0, colon).trim(),
      accent: title.slice(colon + 1).trim(),
    }
  }
  return { main: title }
}

export function CourseDetailPage({
  course,
  relatedCourses,
  auth,
  enrollment,
  onBuyNow,
  onEnrollFree,
  isAddingItem,
  onAddToCart,
  cart,
  addedItem,
  enrolledCourse,
  labels,
}: CourseDetailPageProps) {
  const { lang } = useParams()
  const titleParts = parseCourseTitle(course.title)
  // Hand-curated outcomes (mock/CMS) win; otherwise the API's parsed list.
  const learningOutcomes =
    course.learningOutcomes ?? course.metadata?.learningsList ?? []
  const [open, setOpen] = useState(false)
  const [
    openEnrollmentConfirmationDialog,
    setOpenEnrollmentConfirmationDialog,
  ] = useState(false)

  return (
    <main className="bg-surface-page">
      <div className="mx-auto px-page-x py-stack-lg">
        <nav aria-label="Migas de pan" className="pb-stack">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-content-muted">
            <li>
              <Link to={`/${lang}`} className="hover:underline">
                {labels.breadcrumbHome}
              </Link>
            </li>
            <IconChevronRight aria-hidden className="size-3.5" />
            <li>
              <Link to={`/${lang}/courses`} className="hover:underline">
                {labels.breadcrumbCourses}
              </Link>
            </li>
            <IconChevronRight aria-hidden className="size-3.5" />
            <li
              aria-current="page"
              className="font-semibold text-content-primary"
            >
              {course.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 pb-stack">
          {course.category && (
            <Pill tone="ink">
              {course.category.name.replace(/[.\s]+$/, "")}
            </Pill>
          )}
          {course.level && <Pill tone="yellow">{labels.levelPrefix} {course.level.name}</Pill>}
          {course.tags?.slice(0, 4).map((tag) => (
            <Pill key={tag} className="text-content-muted">
              {tag}
            </Pill>
          ))}
        </div>

        <div className="grid items-start gap-stack-lg lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-stack-lg">
            <header className="rounded-card-lg border-2 border-border-strong bg-academy-blue p-card text-content-inverse shadow-hard-md sm:p-stack-lg">
              <h1 className="text-page-title leading-display font-bold tracking-display">
                {titleParts.main}
                {titleParts.accent && (
                  <em className="mt-1 block font-heading font-medium italic">
                    {titleParts.accent}
                  </em>
                )}
              </h1>
              {course.subtitle && (
                <p className="mt-stack text-sm font-bold tracking-tight-brand uppercase">
                  {course.subtitle}
                </p>
              )}
              {course.shortDescription && (
                <p className="mt-2 text-sm leading-body text-content-inverse/85">
                  {course.shortDescription}
                </p>
              )}
              <div className="mt-stack flex flex-wrap items-center gap-x-4 gap-y-2 text-label">
                {course.reviews?.map(
                  (review) =>
                    review.rating != null && (
                      <RatingStars
                        key={review.rating}
                        rating={review.rating}
                        className="[&_svg]:text-academy-yellow"
                      />
                    )
                )}
                {/* {course != null && (
                  <span>({course.ratingCount.toLocaleString("es-MX")})</span>
                )} */}
                {course.enrollments != null && (
                  <span className="inline-flex items-center gap-1">
                    <IconUsers aria-hidden className="size-3.5" />
                    {course.enrollments.length.toLocaleString("es-MX")}{" "}
                    {labels.studentsLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <IconClock aria-hidden className="size-3.5" />
                  {formatDuration(course.duration)}
                </span>
                {course.topics?.flatMap((item) => item.lessons).length !=
                  null && (
                  <span className="inline-flex items-center gap-1">
                    <IconPlayerPlay
                      aria-hidden
                      className="size-3.5 fill-current"
                    />
                    {course.topics?.flatMap((item) => item.lessons).length}{" "}
                    {labels.lessonsLabel}
                  </span>
                )}
              </div>

              {course.instructor && (
                <p className="mt-stack flex items-center gap-2 text-sm">
                  {course.instructor.avatarUrl && (
                    <img
                      src={course.instructor.avatarUrl}
                      alt=""
                      className="size-8 rounded-pill border-2 border-content-inverse object-cover"
                    />
                  )}
                  <span>
                    <span className="font-bold">{course.instructor.name}</span>
                    {course.instructor.credentials &&
                      ` · ${course.instructor.credentials}`}
                  </span>
                </p>
              )}
            </header>

            <HardCard
              as="section"
              aria-labelledby="outcomes-heading"
              className="p-card"
            >
              <h2
                id="outcomes-heading"
                className="text-card-title font-bold tracking-tight-brand"
              >
                {labels.learnTitle}
              </h2>
              {learningOutcomes.length > 0 ? (
                <ul className="mt-stack grid gap-x-stack-lg gap-y-stack sm:grid-cols-2">
                  {learningOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-sm leading-body"
                    >
                      <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-sm border-2 border-border-strong bg-academy-green text-content-inverse">
                        <IconCheck
                          aria-hidden
                          className="size-3"
                          strokeWidth={3}
                        />
                      </span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-stack text-sm leading-body text-content-muted">
                  {labels.learnEmptyText}
                </p>
              )}
            </HardCard>

            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="text-card-title font-bold tracking-tight-brand"
              >
                {labels.descriptionTitle}
              </h2>
              {/* Plain string from the API — swap for a markdown/rich
                  renderer if `description` turns out to be formatted. */}
              <p className="mt-stack max-w-reading text-sm leading-body whitespace-pre-line text-content-primary/85">
                {course.description}
              </p>
            </section>
          </div>

          {/* Right rail: purchase card with Requisitos below it, per design. */}
          <aside className="flex flex-col gap-stack-lg lg:sticky lg:top-6">
            <PurchaseCard
              labels={labels.purchase}
              course={course}
              auth={auth}
              enrollment={enrollment}
              onBuyNow={onBuyNow}
              onEnrollFree={(courseId) => {
                onEnrollFree(courseId)
                setOpenEnrollmentConfirmationDialog(true)
              }}
              onAddToCart={(courseId) => {
                onAddToCart(courseId)
                setOpen(true)
              }}
              cart={cart}
            />

            {course.requirementsList.length > 0 && (
              <section
                aria-labelledby="requirements-heading"
                className="rounded-card border-2 border-border-strong bg-academy-blue p-card text-content-inverse shadow-hard-sm"
              >
                <h2
                  id="requirements-heading"
                  className="text-card-title font-bold"
                >
                  {labels.requirementsTitle}
                </h2>
                <ul className="mt-stack flex list-disc flex-col gap-stack pl-4 text-sm leading-body font-semibold marker:text-academy-yellow">
                  {course.requirementsList.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {relatedCourses.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-section-y">
            <h2
              id="related-heading"
              className="border-b-2 border-border-strong pb-stack text-section-title leading-display font-bold tracking-display"
            >
              {labels.relatedTitle}
            </h2>
            <p className="mt-stack text-sm font-bold text-academy-coral">
              {labels.relatedSubtitle}
            </p>
            <CourseGrid
              courses={relatedCourses}
              className="mt-stack-lg"
              labels={labels.cardLabels}
            />
          </section>
        )}
      </div>
      <EnrollmentConfirmationDialog
        labels={{
          title: labels.dialogs.enrolledTitle,
          goToCoursesCta: labels.dialogs.goToCoursesCta,
          keepShoppingCta: labels.dialogs.keepShoppingCta,
          cartItem: labels.cartItem,
        }}
        enrolledCourse={enrolledCourse}
        open={openEnrollmentConfirmationDialog}
        onOpenChange={setOpenEnrollmentConfirmationDialog}
        isLoading={isAddingItem}
      />
      <ItemAddedToCartDialog
        labels={{
          title: labels.dialogs.addedToCartTitle,
          boughtTogetherTitle: labels.dialogs.boughtTogetherTitle,
          goToCartCta: labels.dialogs.goToCartCta,
          keepShoppingCta: labels.dialogs.keepShoppingCta,
          cartItem: labels.cartItem,
          cardLabels: labels.cardLabels,
        }}
        addedItem={addedItem}
        open={open}
        onOpenChange={setOpen}
        courses={relatedCourses}
        isLoading={isAddingItem}
      />
    </main>
  )
}
