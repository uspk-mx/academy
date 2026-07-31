import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCategories } from "@academy/courses-api/graphql/admin-app/queries/taxonomy"
import { getAdminPlans } from "@academy/courses-api/graphql/admin-app/queries/catalog"
import {
  createPlan,
  deletePlan,
  updatePlan,
} from "@academy/courses-api/graphql/admin-app/mutations/catalog"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { CardGrid, EntityCard } from "@academy/admin-ui/components/shared/entity-card"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { ListToolbar } from "@academy/admin-ui/components/shared/list-toolbar"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { readListParams, sortAndFilter } from "@academy/admin-ui/lib/list-params"
import { adminOnlyMiddleware } from "@academy/admin-ui/middleware/auth"
import { formatCurrency } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/memberships"

export const middleware = [adminOnlyMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Membresías" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { search, sort } = readListParams(request)

  const [plans, categories] = await Promise.all([
    getAdminPlans(request),
    getAdminCategories(request),
  ])

  const rows = sortAndFilter(plans.subscriptionPlans, {
    search,
    sort,
    nameOf: (plan) => plan.planName,
    createdAtOf: (plan) => plan.createdAt,
  })

  return {
    rows,
    categories: categories.getCategories,
    isFiltered: Boolean(search),
    hasAny: plans.subscriptionPlans.length > 0,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deletePlan(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  const planName = String(form.get("planName") ?? "").trim()
  const planDescription = String(form.get("planDescription") ?? "").trim()
  const price = Number(form.get("price") ?? 0)
  const duration = Number(form.get("duration") ?? 0)
  // Empty means "todas las categorías" — the API reads NULL as full catalogue
  // access, so it must stay null rather than an empty string.
  const categoryId = String(form.get("categoryId") ?? "") || null

  if (!planName) return { error: "El nombre es obligatorio." }
  if (!Number.isFinite(price) || price < 0)
    return { error: "El precio no es válido." }
  if (!Number.isFinite(duration) || duration <= 0)
    return { error: "La duración debe ser mayor a cero." }

  const { error } =
    intent === "update"
      ? await updatePlan(request, {
          input: { id, planName, planDescription, price, duration, categoryId },
        })
      : await createPlan(request, {
          input: { planName, planDescription, price, duration, categoryId },
        })

  return error ? { error: error.message } : { ok: true }
}

type Plan = Route.ComponentProps["loaderData"]["rows"][number]

export default function MembershipsRoute({ loaderData }: Route.ComponentProps) {
  const { rows, categories, isFiltered, hasAny } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<Plan | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<Plan | null>(null)

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
        title={editing ? "Editar membresía" : "Nueva membresía"}
        description="Define el precio, la duración y el alcance del plan."
        formId="membership-form"
        submitLabel={editing ? "Guardar cambios" : "Crear membresía"}
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="membership-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={editing ? "update" : "create"} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <Field label="Nombre" htmlFor="planName" required>
            <Input
              id="planName"
              name="planName"
              defaultValue={editing?.planName ?? ""}
              placeholder="Enfermería Premium"
              required
            />
          </Field>

          <Field label="Descripción" htmlFor="planDescription">
            <Textarea
              id="planDescription"
              name="planDescription"
              rows={3}
              defaultValue={editing?.planDescription ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio (MXN)" htmlFor="price" required>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editing?.price ?? ""}
                required
              />
            </Field>
            <Field label="Duración (días)" htmlFor="duration" required>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                defaultValue={editing?.duration ?? ""}
                placeholder="30"
                required
              />
            </Field>
          </div>

          <Field
            label="Categoría"
            htmlFor="categoryId"
            hint="Sin categoría, el plan da acceso a todo el catálogo."
          >
            <Select name="categoryId" defaultValue={editing?.category?.id ?? ""}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Todas las categorías" />
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
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Membresía"
        resourceName={deleting?.planName}
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
        <PageBreadcrumbs items={[{ label: "Membresías" }]} />
        <EmptyState
          title="Sin membresías creadas aún"
          description="Crea tu primer plan de suscripción para empezar a vender acceso."
          actionLabel="Nueva membresía"
          onAction={openCreate}
        />
        {dialogs}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Membresías" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Membresías</h1>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nueva membresía
        </BrandButton>
      </div>

      <ListToolbar searchPlaceholder="Buscar membresías..." />

      {rows.length === 0 && isFiltered ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos membresías que coincidan con tu búsqueda."
        />
      ) : (
        <CardGrid>
          {rows.map((plan) => (
            <EntityCard
              key={plan.id}
              title={plan.planName}
              description={plan.planDescription}
              eyebrow={
                <Pill tone="white">
                  {plan.category?.name ?? "Todo el catálogo"}
                </Pill>
              }
              footer={
                <>
                  <span className="font-bold">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-label text-content-muted">
                    {plan.duration} días
                  </span>
                </>
              }
              actions={[
                {
                  label: "Editar",
                  onSelect: () => {
                    setEditing(plan)
                    setSheetOpen(true)
                  },
                },
                {
                  label: "Eliminar",
                  destructive: true,
                  onSelect: () => setDeleting(plan),
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
