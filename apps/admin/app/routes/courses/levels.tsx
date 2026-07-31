import { getAdminLevels } from "@academy/courses-api/graphql/admin-app/queries/taxonomy"
import {
  createLevel,
  deleteLevel,
  updateLevel,
} from "@academy/courses-api/graphql/admin-app/mutations/taxonomy"
import { TaxonomyPage } from "@academy/admin-ui/components/pages/taxonomy-page"
import { adminOnlyMiddleware } from "@academy/admin-ui/middleware/auth"
import type { Route } from "./+types/levels"

export const middleware = [adminOnlyMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Niveles" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { getLevels } = await getAdminLevels(request)
  return { rows: getLevels }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")
  const name = String(form.get("name") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()

  if (intent === "delete") {
    const { error } = await deleteLevel(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  if (!name) return { error: "El nombre es obligatorio." }

  const { error } =
    intent === "update"
      ? await updateLevel(request, { id, input: { name, description } })
      : await createLevel(request, { input: { name, description } })

  return error ? { error: error.message } : { ok: true }
}

export default function LevelsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <TaxonomyPage
      rows={loaderData.rows}
      singular="Nivel"
      plural="Niveles"
      breadcrumbs={[{ label: "Cursos", href: "/courses" }, { label: "Niveles" }]}
    />
  )
}
