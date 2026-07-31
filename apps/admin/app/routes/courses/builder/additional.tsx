import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import {
  getAdminCourse,
  getAdminCourses,
} from "@academy/courses-api/graphql/admin-app/queries/courses"
import { getAdminInternalUsers } from "@academy/courses-api/graphql/admin-app/queries/users"
import {
  assignInstructor,
  setCoursePrerequisites,
  unassignInstructor,
  updateCourse,
} from "@academy/courses-api/graphql/admin-app/mutations/courses"
import { CoursePicker } from "@academy/admin-ui/components/shared/course-picker"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@academy/admin-ui/components/ui/card"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconX } from "@tabler/icons-react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/additional"

export function meta() {
  return [{ title: "USPK Academy | Datos adicionales" }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const [course, catalogue, staff] = await Promise.all([
    getAdminCourse(request, params.cid),
    // Prerequisites can point at any course, so the picker needs the catalogue.
    getAdminCourses(request, { limit: 200, page: 1 }),
    getAdminInternalUsers(request),
  ])

  return {
    course: course.course,
    courseOptions: catalogue.instructorCourses.course,
    staff: staff.internalUsers,
  }
}

function optional(form: FormData, key: string): string | null {
  const value = String(form.get(key) ?? "").trim()
  return value || null
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")

  if (intent === "prerequisites") {
    const { error } = await setCoursePrerequisites(request, {
      input: {
        courseId: params.cid,
        requiredCourseIds: form.getAll("requiredCourseIds").map(String),
      },
    })
    return error ? { error: error.message } : { ok: true }
  }

  if (intent === "assign-instructor") {
    const { error } = await assignInstructor(request, {
      userId: String(form.get("userId") ?? ""),
      courseId: params.cid,
    })
    return error ? { error: error.message } : { ok: true }
  }

  if (intent === "unassign-instructor") {
    const { error } = await unassignInstructor(request, {
      userId: String(form.get("userId") ?? ""),
      courseId: params.cid,
    })
    return error ? { error: error.message } : { ok: true }
  }

  // Metadata rides on updateCourse, which requires the title to stay set.
  const { error } = await updateCourse(request, {
    id: params.cid,
    input: {
      title: String(form.get("title") ?? ""),
      requirements: optional(form, "requirements"),
      metadata: {
        learnings: optional(form, "learnings"),
        benefits: optional(form, "benefits"),
        targetAudience: optional(form, "targetAudience"),
        materialsIncluded: optional(form, "materialsIncluded"),
        requirementsInstructions: optional(form, "requirementsInstructions"),
      },
    },
  })

  return error ? { error: error.message } : { ok: true }
}

export default function CourseAdditionalRoute({
  loaderData,
}: Route.ComponentProps) {
  const { course, courseOptions, staff } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const submitting = fetcher.state !== "idle"

  useFetcherOutcome(fetcher)

  const assignedIds = new Set(course.instructors?.map((user) => user.id) ?? [])
  const assignable = staff.filter((user) => !assignedIds.has(user.id))

  return (
    <div className="space-y-6">
      <fetcher.Form method="post" className="space-y-6">
        <input type="hidden" name="intent" value="metadata" />
        <input type="hidden" name="title" value={course.title} />

        <Card>
          <CardHeader>
            <CardTitle>Lo que el alumno aprenderá</CardTitle>
            <CardDescription>
              Una idea por línea — la página del curso las convierte en lista.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <Field label="Aprendizajes" htmlFor="learnings">
              <Textarea
                id="learnings"
                name="learnings"
                rows={5}
                defaultValue={course.metadata?.learnings ?? ""}
                placeholder={"Interpretar signos vitales\nAdministrar medicamentos"}
              />
            </Field>

            <Field label="Beneficios" htmlFor="benefits">
              <Textarea
                id="benefits"
                name="benefits"
                rows={4}
                defaultValue={course.metadata?.benefits ?? ""}
              />
            </Field>

            <Field label="Público objetivo" htmlFor="targetAudience">
              <Textarea
                id="targetAudience"
                name="targetAudience"
                rows={3}
                defaultValue={course.metadata?.targetAudience ?? ""}
              />
            </Field>

            <Field label="Materiales incluidos" htmlFor="materialsIncluded">
              <Textarea
                id="materialsIncluded"
                name="materialsIncluded"
                rows={3}
                defaultValue={course.metadata?.materialsIncluded ?? ""}
              />
            </Field>

            <Field
              label="Requisitos"
              htmlFor="requirements"
              hint="Uno por línea."
            >
              <Textarea
                id="requirements"
                name="requirements"
                rows={4}
                defaultValue={course.requirements ?? ""}
              />
            </Field>

            <Field
              label="Instrucciones sobre los requisitos"
              htmlFor="requirementsInstructions"
            >
              <Textarea
                id="requirementsInstructions"
                name="requirementsInstructions"
                rows={3}
                defaultValue={course.metadata?.requirements ?? ""}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <BrandButton type="submit" disabled={submitting}>
              Guardar
            </BrandButton>
          </div>
        </Card>
      </fetcher.Form>

      <Card>
        <CardHeader>
          <CardTitle>Cursos previos requeridos</CardTitle>
          <CardDescription>
            El curso permanece bloqueado hasta que el alumno complete los que
            marques aquí.
          </CardDescription>
        </CardHeader>

        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="prerequisites" />
          <CoursePicker
            name="requiredCourseIds"
            courses={courseOptions}
            excludeId={course.id}
            defaultSelectedIds={course.prerequisites?.map((item) => item.id) ?? []}
          />
          <div className="flex justify-end">
            <BrandButton type="submit" variant="outline" disabled={submitting}>
              Guardar requisitos
            </BrandButton>
          </div>
        </fetcher.Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructores</CardTitle>
          <CardDescription>
            Quiénes aparecen como responsables del curso.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-wrap gap-2">
          {course.instructors?.length ? (
            course.instructors.map((instructor) => (
              <Pill key={instructor.id} tone="white" className="gap-1 pr-1">
                {instructor.fullName}
                <IconButton
                  className="size-5"
                  aria-label={`Quitar a ${instructor.fullName}`}
                  onClick={() =>
                    fetcher.submit(
                      { intent: "unassign-instructor", userId: instructor.id },
                      { method: "post" }
                    )
                  }
                >
                  <IconX className="size-3" />
                </IconButton>
              </Pill>
            ))
          ) : (
            <p className="text-sm text-content-muted">
              Sin instructores asignados.
            </p>
          )}
        </div>

        <fetcher.Form method="post" className="flex items-end gap-2">
          <input type="hidden" name="intent" value="assign-instructor" />
          <Field label="Agregar instructor" htmlFor="userId" className="flex-1">
            <Select name="userId">
              <SelectTrigger id="userId">
                <SelectValue placeholder="Selecciona a alguien del staff" />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName} — {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <BrandButton type="submit" variant="outline" disabled={submitting}>
            Asignar
          </BrandButton>
        </fetcher.Form>
      </Card>
    </div>
  )
}
