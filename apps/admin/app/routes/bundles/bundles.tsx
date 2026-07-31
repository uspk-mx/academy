import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import {
  getAdminBundles,
  getAdminCourseOptions,
} from "@academy/courses-api/graphql/admin-app/queries/catalog"
import {
  createBundle,
  deleteBundle,
  updateBundle,
} from "@academy/courses-api/graphql/admin-app/mutations/catalog"
import { CoursePicker } from "@academy/admin-ui/components/shared/course-picker"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { CardGrid, EntityCard } from "@academy/admin-ui/components/shared/entity-card"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { ListToolbar } from "@academy/admin-ui/components/shared/list-toolbar"
import { Pagination } from "@academy/admin-ui/components/shared/pagination"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { readListParams } from "@academy/admin-ui/lib/list-params"
import { formatCurrency } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/bundles"

export function meta() {
  return [{ title: "USPK Academy | Bundles" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { search, sortBy, sortOrder, page, limit } = readListParams(request)

  const [bundles, options] = await Promise.all([
    getAdminBundles(request, { search, sortBy, sortOrder, page, limit }),
    getAdminCourseOptions(request),
  ])

  return {
    bundles: bundles.instructorBundles.bundle,
    totalCount: bundles.instructorBundles.totalCount ?? 0,
    pageInfo: bundles.instructorBundles.pageInfo,
    courseOptions: options.instructorCourses.course,
    isFiltered: Boolean(search),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deleteBundle(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  const title = String(form.get("title") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()
  const featuredImage = String(form.get("featuredImage") ?? "").trim()
  const price = Number(form.get("price") ?? 0)
  const discountType = String(form.get("discountType") ?? "") || null
  const discountValueRaw = String(form.get("discountValue") ?? "")
  const discountValue = discountValueRaw ? Number(discountValueRaw) : null
  const courseIds = form.getAll("courseIds").map(String)

  if (!title) return { error: "El título es obligatorio." }
  if (courseIds.length === 0)
    return { error: "Selecciona al menos un curso para el bundle." }

  const { error } =
    intent === "update"
      ? await updateBundle(request, {
          input: {
            id,
            title,
            description,
            featuredImage,
            price,
            discountType: discountType as "PERCENTAGE" | "FIXED" | null,
            discountValue,
            courseIds,
          },
        })
      : await createBundle(request, {
          input: {
            title,
            description,
            featuredImage,
            price,
            discountType: discountType as "PERCENTAGE" | "FIXED" | null,
            discountValue,
            courseIds,
          },
        })

  return error ? { error: error.message } : { ok: true }
}

type Bundle = Route.ComponentProps["loaderData"]["bundles"][number]

export default function BundlesRoute({ loaderData }: Route.ComponentProps) {
  const { bundles, totalCount, pageInfo, courseOptions, isFiltered } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<Bundle | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<Bundle | null>(null)

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

  const sheet = (
    <>
      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? "Editar bundle" : "Nuevo bundle"}
        description="Agrupa varios cursos y véndelos a un precio único."
        formId="bundle-form"
        submitLabel={editing ? "Guardar cambios" : "Crear bundle"}
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="bundle-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={editing ? "update" : "create"} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <Field label="Título" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.title ?? ""} required />
          </Field>

          <Field label="Descripción" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
            />
          </Field>

          <MediaField
            label="Imagen destacada"
            name="featuredImage"
            folder="bundles"
            defaultValue={editing?.featuredImage}
            hint="Portada del bundle en el catálogo."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Precio" htmlFor="price" required>
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
            <Field label="Descuento" htmlFor="discountType">
              <Select name="discountType" defaultValue={editing?.discountType ?? ""}>
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                  <SelectItem value="FIXED">Monto fijo</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor" htmlFor="discountValue">
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editing?.discountValue ?? ""}
              />
            </Field>
          </div>

          <Field label="Cursos incluidos" required>
            <CoursePicker
              name="courseIds"
              courses={courseOptions}
              defaultSelectedIds={
                editing?.courses.flatMap((course) => (course ? [course.id] : [])) ?? []
              }
            />
          </Field>
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Bundle"
        resourceName={deleting?.title}
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

  if (bundles.length === 0 && !isFiltered) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Bundles" }]} />
        <EmptyState
          title="Sin bundles creados aún"
          description="Empaqueta varios cursos y ofrécelos con descuento."
          actionLabel="Nuevo bundle"
          onAction={openCreate}
        />
        {sheet}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Bundles" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Bundles</h1>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nuevo bundle
        </BrandButton>
      </div>

      <ListToolbar searchPlaceholder="Buscar bundles..." />

      {bundles.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos bundles que coincidan con tu búsqueda."
        />
      ) : (
        <CardGrid>
          {bundles.map((bundle) => (
            <EntityCard
              key={bundle.id}
              title={bundle.title}
              imageUrl={bundle.featuredImage}
              description={bundle.description}
              eyebrow={
                <Pill tone="white">
                  {bundle.courses.length} curso
                  {bundle.courses.length === 1 ? "" : "s"}
                </Pill>
              }
              footer={
                <>
                  <span className="font-bold">
                    {formatCurrency(bundle.price)}
                  </span>
                  {bundle.subtotalRegularPrice ? (
                    <span className="text-label text-content-muted line-through">
                      {formatCurrency(bundle.subtotalRegularPrice)}
                    </span>
                  ) : null}
                </>
              }
              actions={[
                {
                  label: "Editar",
                  onSelect: () => {
                    setEditing(bundle)
                    setSheetOpen(true)
                  },
                },
                {
                  label: "Eliminar",
                  destructive: true,
                  onSelect: () => setDeleting(bundle),
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

      {sheet}
    </>
  )
}
