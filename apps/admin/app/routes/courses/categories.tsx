import { getAdminCategories } from "@academy/courses-api/graphql/admin-app/queries/taxonomy"
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@academy/courses-api/graphql/admin-app/mutations/taxonomy"
import { TaxonomyPage } from "@academy/admin-ui/components/pages/taxonomy-page"
import { adminOnlyMiddleware } from "@academy/admin-ui/middleware/auth"
import type { Route } from "./+types/categories"

export const middleware = [adminOnlyMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Categorías" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { getCategories } = await getAdminCategories(request)
  return { rows: getCategories }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")
  const name = String(form.get("name") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()

  if (intent === "delete") {
    const { error } = await deleteCategory(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  if (!name) return { error: "El nombre es obligatorio." }

  const { error } =
    intent === "update"
      ? await updateCategory(request, { id, input: { name, description } })
      : await createCategory(request, { input: { name, description } })

  return error ? { error: error.message } : { ok: true }
}

export default function CategoriesRoute({ loaderData }: Route.ComponentProps) {
  return (
    <TaxonomyPage
      rows={loaderData.rows}
      singular="Categoría"
      plural="Categorías"
      breadcrumbs={[{ label: "Cursos", href: "/courses" }, { label: "Categorías" }]}
    />
  )
}
