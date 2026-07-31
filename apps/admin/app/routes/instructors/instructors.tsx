import { getAdminInstructors } from "@academy/courses-api/graphql/admin-app/queries/users"
import { AdminTable } from "@academy/admin-ui/components/shared/admin-table"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { formatDate } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import type { Route } from "./+types/instructors"

export function meta() {
  return [{ title: "USPK Academy | Instructores" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { instructors } = await getAdminInstructors(request)
  return { rows: instructors }
}

export default function InstructorsRoute({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData

  if (rows.length === 0) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Instructores" }]} />
        <EmptyState
          title="Sin instructores asignados"
          description="Asigna instructores desde la pestaña de ajustes de cada curso."
          actionLabel="Ir a cursos"
          href="/courses"
        />
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Instructores" }]} />
      <h1 className="text-section-title leading-display font-bold tracking-display">Instructores</h1>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            header: "Instructor",
            cell: (row) => (
              <div className="flex flex-col">
                <span className="font-bold">{row.user.fullName}</span>
                <span className="text-label text-content-muted">
                  {row.user.email}
                </span>
              </div>
            ),
            width: "20rem",
          },
          {
            header: "Cursos",
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                {row.courses.length === 0 ? (
                  <span className="text-content-muted">—</span>
                ) : (
                  row.courses.map((course) => (
                    <Pill key={course.id} tone="white">
                      {course.title}
                    </Pill>
                  ))
                )}
              </div>
            ),
          },
          {
            header: "Asignado",
            cell: (row) => formatDate(row.assignedAt),
            width: "9rem",
          },
        ]}
      />
    </>
  )
}
