import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCompanies } from "@academy/courses-api/graphql/admin-app/queries/companies"
import {
  createCompany,
  deleteCompany,
  inviteAdmins,
  updateCompany,
} from "@academy/courses-api/graphql/admin-app/mutations/companies"
import { AdminTable } from "@academy/admin-ui/components/shared/admin-table"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { Field } from "@academy/admin-ui/components/ui/field"
import { Switch } from "@academy/admin-ui/components/ui/switch"
import { adminOnlyMiddleware } from "@academy/admin-ui/middleware/auth"
import { formatDate } from "@academy/admin-ui/lib/utils"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconMail, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/companies"

export const middleware = [adminOnlyMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Empresas" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { companies } = await getAdminCompanies(request)
  return { rows: companies }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const companyId = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deleteCompany(request, { companyId })
    return error ? { error: error.message } : { ok: true }
  }

  if (intent === "invite") {
    // One address per line in the textarea; blank lines are ignored.
    const emails = String(form.get("emails") ?? "")
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean)

    if (emails.length === 0) return { error: "Agrega al menos un correo." }

    const { data, error } = await inviteAdmins(request, {
      input: { companyId, emails, mode: "ADMIN" },
    })

    if (error) return { error: error.message }

    const result = data?.inviteAdmins
    if (result?.errors.length) return { error: result.errors.join(" · ") }
    return { ok: true, message: `${result?.invited ?? 0} invitaciones enviadas` }
  }

  const name = String(form.get("name") ?? "").trim()
  const email = String(form.get("email") ?? "").trim()
  const address = String(form.get("address") ?? "").trim()
  const taxId = String(form.get("taxId") ?? "").trim() || null
  const taxName = String(form.get("taxName") ?? "").trim() || null
  const isActive = form.get("isActive") === "on"

  if (!name) return { error: "El nombre es obligatorio." }
  if (!email) return { error: "El correo es obligatorio." }

  const { error } =
    intent === "update"
      ? await updateCompany(request, {
          companyId,
          input: { name, email, address, taxId, taxName, isActive },
        })
      : await createCompany(request, {
          input: { name, email, address, taxId, taxName, isActive },
        })

  return error ? { error: error.message } : { ok: true }
}

type Company = Route.ComponentProps["loaderData"]["rows"][number]

export default function CompaniesRoute({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean; message?: string }>()
  const [editing, setEditing] = useState<Company | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [inviting, setInviting] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState<Company | null>(null)

  const submitting = fetcher.state !== "idle"

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setSheetOpen(false)
        setInviting(null)
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
        title={editing ? "Editar empresa" : "Nueva empresa"}
        description="Los datos fiscales se usan en la facturación de sus licencias."
        formId="company-form"
        submitLabel={editing ? "Guardar cambios" : "Crear empresa"}
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="company-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={editing ? "update" : "create"} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <Field label="Nombre" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={editing?.name ?? ""} required />
          </Field>

          <Field label="Correo de contacto" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={editing?.email ?? ""}
              required
            />
          </Field>

          <Field label="Dirección" htmlFor="address">
            <Textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={editing?.address ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="RFC / Tax ID" htmlFor="taxId">
              <Input id="taxId" name="taxId" defaultValue={editing?.taxId ?? ""} />
            </Field>
            <Field label="Razón social" htmlFor="taxName">
              <Input
                id="taxName"
                name="taxName"
                defaultValue={editing?.taxName ?? ""}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <Switch
              name="isActive"
              defaultChecked={editing ? (editing.isActive ?? false) : true}
            />
            Empresa activa
          </label>
        </fetcher.Form>
      </FormSheet>

      <FormSheet
        open={Boolean(inviting)}
        onOpenChange={(open) => !open && setInviting(null)}
        title="Invitar administradores"
        description={`Enviaremos una invitación para administrar ${inviting?.name ?? ""}.`}
        formId="invite-form"
        submitLabel="Enviar invitaciones"
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="invite-form"
          key={inviting?.id ?? "invite"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value="invite" />
          <input type="hidden" name="id" value={inviting?.id ?? ""} />
          <Field
            label="Correos"
            htmlFor="emails"
            required
            hint="Uno por línea, o separados por coma."
          >
            <Textarea
              id="emails"
              name="emails"
              rows={5}
              placeholder={"ana@empresa.com\nluis@empresa.com"}
              required
            />
          </Field>
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Empresa"
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

  if (rows.length === 0) {
    return (
      <>
        <PageBreadcrumbs items={[{ label: "Empresas" }]} />
        <EmptyState
          title="Sin empresas registradas"
          description="Registra una empresa para venderle licencias corporativas."
          actionLabel="Nueva empresa"
          onAction={openCreate}
        />
        {dialogs}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Empresas" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Empresas</h1>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nueva empresa
        </BrandButton>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          {
            header: "Empresa",
            cell: (row) => (
              <div className="flex flex-col">
                <span className="font-bold">{row.name}</span>
                <span className="text-label text-content-muted">{row.email}</span>
              </div>
            ),
            width: "18rem",
          },
          {
            header: "Suscripciones",
            cell: (row) => (
              <Pill tone="white">{row.subscriptions.length}</Pill>
            ),
            width: "8rem",
          },
          {
            header: "Estado",
            cell: (row) => (
              <Pill tone={row.isActive ? "ink" : "white"}>
                {row.isActive ? "Activa" : "Inactiva"}
              </Pill>
            ),
            width: "8rem",
          },
          {
            header: "Alta",
            cell: (row) => formatDate(row.createdAt),
            width: "9rem",
          },
        ]}
        actions={[
          {
            label: "Editar",
            icon: <IconPencil className="size-4" />,
            onSelect: (row) => {
              setEditing(row)
              setSheetOpen(true)
            },
          },
          {
            label: "Invitar administradores",
            icon: <IconMail className="size-4" />,
            onSelect: setInviting,
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
