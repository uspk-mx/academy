import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import {
  getAdminCourseOptions,
  getAdminEnrollments,
} from "@academy/courses-api/graphql/admin-app/queries/catalog"
import { getAdminUsers } from "@academy/courses-api/graphql/admin-app/queries/users"
import {
  createEnrollment,
  deleteEnrollment,
  updateEnrollmentStatus,
} from "@academy/courses-api/graphql/admin-app/mutations/catalog"
import { AdminTable } from "@academy/admin-ui/components/shared/admin-table"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { formatDate } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { IconPlus, IconTrash, IconCheck, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/enrollments"

export function meta() {
  return [{ title: "USPK Academy | Inscripciones" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const [enrollments, users, courses] = await Promise.all([
    getAdminEnrollments(request),
    getAdminUsers(request),
    getAdminCourseOptions(request),
  ])

  return {
    rows: enrollments.getEnrollments ?? [],
    // Only students can be enrolled; staff and company accounts are excluded.
    students: (users.getUsers ?? []).filter((user) => user?.role === "student"),
    courses: courses.instructorCourses.course.filter(
      (course) => course.status === "PUBLISHED"
    ),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")

  if (intent === "delete") {
    const { error } = await deleteEnrollment(request, {
      enrollmentId: String(form.get("id") ?? ""),
    })
    return error ? { error: error.message } : { ok: true }
  }

  if (intent === "status") {
    const { error } = await updateEnrollmentStatus(request, {
      enrollmentId: String(form.get("id") ?? ""),
      status: String(form.get("status") ?? ""),
    })
    return error ? { error: error.message } : { ok: true }
  }

  const userId = String(form.get("userId") ?? "")
  const courseId = String(form.get("courseId") ?? "")
  if (!userId || !courseId)
    return { error: "Selecciona un estudiante y un curso." }

  const { error } = await createEnrollment(request, { userId, courseId })
  return error ? { error: error.message } : { ok: true }
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  DROPPED: "Cancelada",
}

type Enrollment = Route.ComponentProps["loaderData"]["rows"][number]

export default function EnrollmentsRoute({ loaderData }: Route.ComponentProps) {
  const { rows, students, courses } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<Enrollment | null>(null)

  const submitting = fetcher.state !== "idle"

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setSheetOpen(false)
        setDeleting(null)
    },
  })

  const setStatus = (row: Enrollment, status: string) =>
    fetcher.submit({ intent: "status", id: row.id, status }, { method: "post" })

  const dialogs = (
    <>
      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Inscribir estudiante"
        description="La inscripción da acceso inmediato al curso."
        formId="enrollment-form"
        submitLabel="Inscribir"
        submitting={submitting}
      >
        <fetcher.Form method="post" id="enrollment-form" className="space-y-4 pt-2">
          <input type="hidden" name="intent" value="create" />

          <Field label="Estudiante" htmlFor="userId" required>
            <Select name="userId">
              <SelectTrigger id="userId">
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student!.id} value={student!.id}>
                    {student!.fullName} — {student!.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Curso"
            htmlFor="courseId"
            required
            hint="Solo se listan los cursos publicados."
          >
            <Select name="courseId">
              <SelectTrigger id="courseId">
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Inscripción"
        resourceName={
          deleting ? `${deleting.user.fullName} — ${deleting.course.title}` : null
        }
        isLoading={submitting}
        onConfirm={() =>
          fetcher.submit(
            { intent: "delete", id: deleting?.id ?? "" },
            { method: "post" }
          )
        }
      />
    </>
  )

  if (rows.length === 0) {
    return (
      <>
        <PageBreadcrumbs
          items={[{ label: "Cursos", href: "/courses" }, { label: "Inscripciones" }]}
        />
        <EmptyState
          title="Sin inscripciones aún"
          description="Aquí verás las inscripciones en cuanto existan."
          actionLabel="Inscribir estudiante"
          onAction={() => setSheetOpen(true)}
        />
        {dialogs}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs
        items={[{ label: "Cursos", href: "/courses" }, { label: "Inscripciones" }]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Inscripciones</h1>
        <BrandButton onClick={() => setSheetOpen(true)}>
          <IconPlus className="size-4" />
          Inscribir estudiante
        </BrandButton>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            header: "Estudiante",
            cell: (row) => (
              <div className="flex flex-col">
                <span className="font-bold">{row.user.fullName}</span>
                <span className="text-label text-content-muted">
                  {row.user.email}
                </span>
              </div>
            ),
            width: "18rem",
          },
          {
            header: "Curso",
            cell: (row) => row.course.title,
          },
          {
            header: "Estado",
            cell: (row) => (
              <Pill tone={row.status === "ACTIVE" ? "ink" : "white"}>
                {STATUS_LABEL[row.status] ?? row.status}
              </Pill>
            ),
            width: "8rem",
          },
          {
            header: "Inscrito",
            cell: (row) => formatDate(row.enrolledAt),
            width: "9rem",
          },
        ]}
        actions={[
          {
            label: "Marcar completada",
            icon: <IconCheck className="size-4" />,
            onSelect: (row) => setStatus(row, "COMPLETED"),
          },
          {
            label: "Cancelar inscripción",
            icon: <IconX className="size-4" />,
            onSelect: (row) => setStatus(row, "DROPPED"),
          },
          {
            label: "Eliminar",
            icon: <IconTrash className="size-4" />,
            destructive: true,
            onSelect: setDeleting,
          },
        ]}
      />

      {dialogs}
    </>
  )
}
