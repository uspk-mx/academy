import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { Field } from "@academy/admin-ui/components/ui/field"
import { Input, Textarea } from "@academy/admin-ui/components/ui/input"
import { AdminTable } from "@academy/admin-ui/components/shared/admin-table"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { PageHeading } from "@academy/admin-ui/components/shell/admin-shell"
import { formatDate } from "@academy/admin-ui/lib/utils"

export interface TaxonomyRow {
  id: string
  name: string
  description: string | null
  coursesCount: number | null
  createdAt: string
}

/**
 * Levels and categories are the same screen with different nouns, so they share
 * this component: a list, a create/edit side panel and a delete confirmation.
 * All three write through the route's own action via a fetcher, which means the
 * list revalidates itself and no client cache has to be kept in sync.
 */
export function TaxonomyPage({
  rows,
  singular,
  plural,
  breadcrumbs,
}: {
  rows: TaxonomyRow[]
  /** "Categoría" — used in dialog titles and toasts. */
  singular: string
  /** "Categorías" — used in the page heading. */
  plural: string
  breadcrumbs: { label: string; href?: string }[]
}) {
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<TaxonomyRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<TaxonomyRow | null>(null)

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

  const openEdit = (row: TaxonomyRow) => {
    setEditing(row)
    setSheetOpen(true)
  }

  const lowerSingular = singular.toLowerCase()

  return (
    <>
      <PageBreadcrumbs items={breadcrumbs} />

      <PageHeading
        title={plural}
        action={
          <BrandButton variant="promo" onClick={openCreate}>
            <IconPlus className="size-4" strokeWidth={2.5} />
            Nueva {lowerSingular}
          </BrandButton>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title={`Sin ${plural.toLowerCase()} aún`}
          description={`Crea tu primera ${lowerSingular} para empezar a organizar los cursos.`}
          actionLabel={`Nueva ${lowerSingular}`}
          onAction={openCreate}
        />
      ) : (
        <AdminTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              header: "Nombre",
              cell: (row) => <span className="font-bold">{row.name}</span>,
              width: "14rem",
            },
            {
              header: "Descripción",
              cell: (row) => (
                <span className="line-clamp-2 text-content-muted">
                  {row.description || "—"}
                </span>
              ),
            },
            {
              header: "Cursos",
              cell: (row) => <Pill tone="white">{row.coursesCount ?? 0}</Pill>,
              width: "7rem",
            },
            {
              header: "Creado",
              cell: (row) => formatDate(row.createdAt),
              width: "9rem",
            },
          ]}
          actions={[
            {
              label: "Editar",
              icon: <IconPencil className="size-4" />,
              onSelect: openEdit,
            },
            {
              label: "Eliminar",
              icon: <IconTrash className="size-4" />,
              destructive: true,
              onSelect: setDeleting,
            },
          ]}
        />
      )}

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? `Editar ${lowerSingular}` : `Nueva ${lowerSingular}`}
        description={`Los cursos se agrupan por ${lowerSingular} en el catálogo.`}
        formId="taxonomy-form"
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        submitting={submitting}
      >
        {/* `key` resets the uncontrolled inputs when switching rows. */}
        <fetcher.Form
          method="post"
          id="taxonomy-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-4"
        >
          <input
            type="hidden"
            name="intent"
            value={editing ? "update" : "create"}
          />
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Nombre" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              defaultValue={editing?.name ?? ""}
              placeholder={`Nombre de la ${lowerSingular}`}
              required
            />
          </Field>
          <Field
            label="Descripción"
            htmlFor="description"
            hint="Se muestra en el catálogo público."
          >
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={editing?.description ?? ""}
            />
          </Field>
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType={singular}
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
}
