import { getAdminCategories, getAdminLevels } from "@academy/courses-api/graphql/admin-app/queries/taxonomy"
import { createInitialCourse } from "@academy/courses-api/graphql/admin-app/mutations/courses"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { adminAuthMiddleware } from "@academy/admin-ui/middleware/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { IconArrowLeft } from "@tabler/icons-react"
import { Form, Link, redirect, useNavigation } from "react-router"
import type { Route } from "./+types/create-course"

export const middleware = [adminAuthMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Nuevo curso" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const [levels, categories] = await Promise.all([
    getAdminLevels(request),
    getAdminCategories(request),
  ])

  return { levels: levels.getLevels, categories: categories.getCategories }
}

/**
 * Only the title is required to get a course row: everything else is edited in
 * the builder, so this step exists purely to obtain an id to redirect into.
 */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const title = String(form.get("title") ?? "").trim()
  const levelId = String(form.get("levelId") ?? "") || null
  const categoryId = String(form.get("categoryId") ?? "") || null

  if (!title) return { fieldErrors: { title: "El título es obligatorio." } }

  const { data, error } = await createInitialCourse(request, {
    input: { title, status: "DRAFT", levelId, categoryId },
  })

  if (error || !data?.createInitialCourse) {
    return { formError: error?.message ?? "No pudimos crear el curso." }
  }

  return redirect(`/courses/${data.createInitialCourse.id}/builder`)
}

export default function CreateCourseRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { levels, categories } = loaderData
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"

  return (
    <main className="min-h-svh bg-surface-page">
      <header className="border-b-2 border-border-strong bg-surface-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-6">
          <IconButton to="/courses">
            <IconArrowLeft className="size-4" />
            <span className="sr-only">Volver a cursos</span>
          </IconButton>
          <span className="font-heading font-medium">Nuevo curso</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-6">
        <div className="space-y-6 rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-xs">
          <div className="space-y-1">
            <h1 className="text-card-title leading-display font-bold tracking-tight-brand">
              Empecemos por lo básico
            </h1>
            <p className="text-sm text-content-muted">
              Podrás cambiar todo esto —y mucho más— en el constructor del curso.
            </p>
          </div>

          {actionData?.formError && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {actionData.formError}
            </p>
          )}

          <Form method="post" className="space-y-4" noValidate>
            <Field
              label="Título del curso"
              htmlFor="title"
              required
              error={actionData?.fieldErrors?.title}
              hint="Puedes ajustarlo después."
            >
              <Input
                id="title"
                name="title"
                placeholder="Ej. Farmacología para enfermería"
                autoFocus
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría" htmlFor="categoryId">
                <Select name="categoryId">
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Nivel" htmlFor="levelId">
                <Select name="levelId">
                  <SelectTrigger id="levelId">
                    <SelectValue placeholder="Sin nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <BrandButton variant="outline" to="/courses">
                Cancelar
              </BrandButton>
              <BrandButton type="submit" disabled={submitting}>
                {submitting ? "Creando..." : "Crear y continuar"}
              </BrandButton>
            </div>
          </Form>
        </div>
      </div>
    </main>
  )
}
