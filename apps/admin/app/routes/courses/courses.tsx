import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCourses } from "@academy/courses-api/graphql/admin-app/queries/courses"
import { deleteCourse } from "@academy/courses-api/graphql/admin-app/mutations/courses"
import { CardGrid, EntityCard } from "@academy/admin-ui/components/shared/entity-card"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { ListToolbar } from "@academy/admin-ui/components/shared/list-toolbar"
import { Pagination } from "@academy/admin-ui/components/shared/pagination"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { readListParams } from "@academy/admin-ui/lib/list-params"
import { formatCurrency, relativeUpdatedLabel } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/courses"

export function meta() {
  return [
    { title: "USPK Academy | Cursos" },
    { name: "description", content: "Administra los cursos de USPK Academy." },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { search, sortBy, sortOrder, page, limit } = readListParams(request)

  const { instructorCourses } = await getAdminCourses(request, {
    search,
    sortBy,
    sortOrder,
    page,
    limit,
  })

  return {
    courses: instructorCourses.course,
    totalCount: instructorCourses.totalCount ?? 0,
    pageInfo: instructorCourses.pageInfo,
    isFiltered: Boolean(search),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const id = String(form.get("id") ?? "")

  const { error } = await deleteCourse(request, { id })
  return error ? { error: error.message } : { ok: true }
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Borrador",
  IN_PAUSE: "En pausa",
}

export default function CoursesRoute({ loaderData }: Route.ComponentProps) {
  const { courses, totalCount, pageInfo, isFiltered } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [deleting, setDeleting] = useState<{ id: string; title: string } | null>(
    null
  )

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setDeleting(null)
    },
    successMessage: "Curso eliminado",
  })

  // An empty first page with no filters means "nothing created yet"; with a
  // search term it just means no matches.
  if (courses.length === 0 && !isFiltered) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Cursos" }]} />
        <EmptyState
          title="Sin cursos creados aún"
          description="Crea tu primer curso para empezar."
          actionLabel="Nuevo curso"
          href="/courses/create"
        />
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Cursos" }]} />

      <ListToolbar
        ctaLabel="Nuevo curso"
        ctaHref="/courses/create"
        hasPublishFilters
        searchPlaceholder="Buscar cursos..."
      />

      {courses.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos cursos que coincidan con tu búsqueda."
        />
      ) : (
        <CardGrid>
          {courses.map((course) => (
            <EntityCard
              key={course.id}
              title={course.title}
              href={`/courses/${course.id}/builder`}
              imageUrl={course.featuredImage}
              description={course.shortDescription}
              eyebrow={
                <>
                  <Pill
                    tone={course.status === "PUBLISHED" ? "ink" : "white"}
                  >
                    {STATUS_LABEL[course.status ?? "DRAFT"] ?? course.status}
                  </Pill>
                  {course.category && <span>{course.category.name}</span>}
                </>
              }
              footer={
                <>
                  <span className="font-bold">
                    {course.pricingType === "FREE"
                      ? "Gratis"
                      : formatCurrency(course.discountedPrice ?? course.price)}
                  </span>
                  <span className="text-label text-content-muted">
                    {relativeUpdatedLabel(course.updatedAt)}
                  </span>
                </>
              }
              actions={[
                { label: "Editar", href: `/courses/${course.id}/builder` },
                { label: "Currículum", href: `/courses/${course.id}/curriculum` },
                {
                  label: "Eliminar",
                  destructive: true,
                  onSelect: () =>
                    setDeleting({ id: course.id, title: course.title }),
                },
              ]}
            />
          ))}
        </CardGrid>
      )}

      <Pagination
        page={pageInfo.page}
        limit={pageInfo.limit}
        totalCount={totalCount}
        hasNextPage={pageInfo.hasNextPage}
      />

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Curso"
        resourceName={deleting?.title}
        isLoading={fetcher.state !== "idle"}
        onConfirm={() =>
          fetcher.submit({ id: deleting?.id ?? "" }, { method: "post" })
        }
      />
    </>
  )
}
