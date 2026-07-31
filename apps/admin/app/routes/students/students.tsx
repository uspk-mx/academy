import { getAdminUsers } from "@academy/courses-api/graphql/admin-app/queries/users"
import { AdminTable } from "@academy/admin-ui/components/shared/admin-table"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { formatDate } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import type { Route } from "./+types/students"

export function meta() {
  return [{ title: "USPK Academy | Estudiantes" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { getUsers } = await getAdminUsers(request)
  const rows = (getUsers ?? []).filter((user) => user?.role === "student")
  return { rows }
}

export default function StudentsRoute({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData

  if (rows.length === 0) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Estudiantes" }]} />
        <EmptyState
          title="Sin estudiantes registrados"
          description="Aquí verás a los alumnos en cuanto se registren."
        />
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Estudiantes" }]} />
      <h1 className="text-section-title leading-display font-bold tracking-display">Estudiantes</h1>

      <AdminTable
        rows={rows}
        rowKey={(row) => row!.id}
        columns={[
          {
            header: "Nombre",
            cell: (row) => (
              <div className="flex flex-col">
                <span className="font-bold">{row!.fullName}</span>
                <span className="text-label text-content-muted">
                  {row!.email}
                </span>
              </div>
            ),
            width: "20rem",
          },
          {
            header: "Usuario",
            cell: (row) => row!.userName,
          },
          {
            header: "Verificado",
            cell: (row) => (
              <Pill tone={row!.isVerified ? "ink" : "white"}>
                {row!.isVerified ? "Sí" : "No"}
              </Pill>
            ),
            width: "8rem",
          },
          {
            header: "Alta",
            cell: (row) => formatDate(row!.createdAt),
            width: "9rem",
          },
        ]}
      />
    </>
  )
}
