import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import {
  getAdminCourseOptions,
  getAdminLearningPaths,
} from "@academy/courses-api/graphql/admin-app/queries/catalog"
import {
  createLearningPath,
  deleteLearningPath,
  updateLearningPath,
} from "@academy/courses-api/graphql/admin-app/mutations/catalog"
import { CoursePicker } from "@academy/admin-ui/components/shared/course-picker"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { CardGrid, EntityCard } from "@academy/admin-ui/components/shared/entity-card"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { ListToolbar } from "@academy/admin-ui/components/shared/list-toolbar"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { Field } from "@academy/admin-ui/components/ui/field"
import { readListParams, sortAndFilter } from "@academy/admin-ui/lib/list-params"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/learning-paths"

export function meta() {
  return [{ title: "USPK Academy | Learning Paths" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { search, sort } = readListParams(request)

  const [paths, options] = await Promise.all([
    getAdminLearningPaths(request),
    getAdminCourseOptions(request),
  ])

  // The API returns every path in one shot, so filtering happens here rather
  // than as query arguments.
  const rows = sortAndFilter(paths.learningPaths, {
    search,
    sort,
    nameOf: (path) => path.name,
    createdAtOf: (path) => path.createdAt,
  })

  return {
    rows,
    courseOptions: options.instructorCourses.course,
    isFiltered: Boolean(search),
    hasAny: paths.learningPaths.length > 0,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const learningPathId = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deleteLearningPath(request, { learningPathId })
    return error ? { error: error.message } : { ok: true }
  }

  const name = String(form.get("name") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()
  const featuredImage = String(form.get("featuredImage") ?? "").trim() || null
  const courseIds = form.getAll("courseIds").map(String)

  if (!name) return { error: "El nombre es obligatorio." }
  if (!description) return { error: "La descripción es obligatoria." }

  const { error } =
    intent === "update"
      ? await updateLearningPath(request, {
          learningPathId,
          input: { name, description, featuredImage, courseIds },
        })
      : await createLearningPath(request, {
          input: { name, description, featuredImage, courseIds },
        })

  return error ? { error: error.message } : { ok: true }
}

type LearningPath = Route.ComponentProps["loaderData"]["rows"][number]

export default function LearningPathsRoute({
  loaderData,
}: Route.ComponentProps) {
  const { rows, courseOptions, isFiltered, hasAny } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<LearningPath | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<LearningPath | null>(null)

  const submitting = fetcher.state !== "idle"

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setSheetOpen(false)
        setDeleting(null)
    },
  })

  const openCreate = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const dialogs = (
    <>
      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? "Editar learning path" : "Nuevo learning path"}
        description="Una ruta ordenada de cursos que el alumno recorre de principio a fin."
        formId="learning-path-form"
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="learning-path-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={editing ? "update" : "create"} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <Field label="Nombre" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={editing?.name ?? ""} required />
          </Field>

          <Field label="Descripción" htmlFor="description" required>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              required
            />
          </Field>

          <MediaField
            label="Imagen destacada"
            name="featuredImage"
            folder="learning-paths"
            defaultValue={editing?.featuredImage}
          />

          <Field
            label="Cursos"
            hint="El orden de la ruta sigue el orden del catálogo."
          >
            <CoursePicker
              name="courseIds"
              courses={courseOptions}
              defaultSelectedIds={
                editing?.courses?.map((entry) => entry.course.id) ?? []
              }
            />
          </Field>
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Learning path"
        resourceName={deleting?.name}
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

  if (!hasAny) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Learning Paths" }]} />
        <EmptyState
          title="Sin learning paths creados aún"
          description="Crea tu primera ruta de aprendizaje para guiar a los alumnos."
          actionLabel="Nuevo learning path"
          onAction={openCreate}
        />
        {dialogs}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Learning Paths" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Learning Paths</h1>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nuevo learning path
        </BrandButton>
      </div>

      <ListToolbar searchPlaceholder="Buscar learning paths..." />

      {rows.length === 0 && isFiltered ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos rutas que coincidan con tu búsqueda."
        />
      ) : (
        <CardGrid>
          {rows.map((path) => (
            <EntityCard
              key={path.id}
              title={path.name}
              imageUrl={path.featuredImage}
              description={path.description}
              eyebrow={
                <Pill tone="white">
                  {path.courses?.length ?? 0} curso
                  {(path.courses?.length ?? 0) === 1 ? "" : "s"}
                </Pill>
              }
              actions={[
                {
                  label: "Editar",
                  onSelect: () => {
                    setEditing(path)
                    setSheetOpen(true)
                  },
                },
                {
                  label: "Eliminar",
                  destructive: true,
                  onSelect: () => setDeleting(path),
                },
              ]}
            />
          ))}
        </CardGrid>
      )}

      {dialogs}
    </>
  )
}
