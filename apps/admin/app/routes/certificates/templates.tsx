import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCertificateTemplates } from "@academy/courses-api/graphql/admin-app/queries/catalog"
import {
  createCertificateTemplate,
  deleteCertificateTemplate,
  updateCertificateTemplate,
} from "@academy/courses-api/graphql/admin-app/mutations/catalog"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { CardGrid, EntityCard } from "@academy/admin-ui/components/shared/entity-card"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { Field } from "@academy/admin-ui/components/ui/field"
import { adminOnlyMiddleware } from "@academy/admin-ui/middleware/auth"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/templates"

export const middleware = [adminOnlyMiddleware]

export function meta() {
  return [{ title: "USPK Academy | Plantillas de certificado" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { getCertificateTemplates } = await getAdminCertificateTemplates(request)
  return { rows: getCertificateTemplates ?? [] }
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deleteCertificateTemplate(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  const name = String(form.get("name") ?? "").trim()
  const content = String(form.get("content") ?? "").trim()
  const logoUrl = String(form.get("logoUrl") ?? "").trim() || null
  const background = String(form.get("background") ?? "").trim() || null

  if (!name) return { error: "El nombre es obligatorio." }

  const { error } =
    intent === "update"
      ? await updateCertificateTemplate(request, {
          id,
          input: { name, content, logoUrl, background },
        })
      : await createCertificateTemplate(request, {
          input: { name, content, logoUrl, background },
        })

  return error ? { error: error.message } : { ok: true }
}

type Template = Route.ComponentProps["loaderData"]["rows"][number]

export default function CertificateTemplatesRoute({
  loaderData,
}: Route.ComponentProps) {
  const { rows } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<Template | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<Template | null>(null)

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
        title={editing ? "Editar plantilla" : "Nueva plantilla"}
        description="El contenido admite los marcadores {{studentName}}, {{courseTitle}} y {{issuedAt}}."
        formId="template-form"
        submitLabel={editing ? "Guardar cambios" : "Crear plantilla"}
        submitting={submitting}
      >
        <fetcher.Form
          method="post"
          id="template-form"
          key={editing?.id ?? "new"}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={editing ? "update" : "create"} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <Field label="Nombre" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={editing?.name ?? ""} required />
          </Field>

          <Field
            label="Contenido"
            htmlFor="content"
            hint="Texto que aparece en el cuerpo del certificado."
          >
            <Textarea
              id="content"
              name="content"
              rows={6}
              defaultValue={editing?.content ?? ""}
              placeholder="Otorgamos el presente certificado a {{studentName}} por completar {{courseTitle}}."
            />
          </Field>

          <MediaField
            label="Logotipo"
            name="logoUrl"
            folder="certificates"
            defaultValue={editing?.logoUrl}
          />

          <MediaField
            label="Fondo"
            name="background"
            folder="certificates"
            defaultValue={editing?.background}
          />
        </fetcher.Form>
      </FormSheet>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Plantilla"
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
        <PageBreadcrumbs
          items={[
            { label: "Certificados", href: "/certificates" },
            { label: "Plantillas" },
          ]}
        />
        <EmptyState
          title="Sin plantillas creadas"
          description="Crea una plantilla para los certificados que emiten los cursos."
          actionLabel="Nueva plantilla"
          onAction={openCreate}
        />
        {dialogs}
      </>
    )
  }

  return (
    <>
      <PageBreadcrumbs
        items={[
          { label: "Certificados", href: "/certificates" },
          { label: "Plantillas" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-section-title leading-display font-bold tracking-display">Plantillas</h1>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nueva plantilla
        </BrandButton>
      </div>

      <CardGrid>
        {rows.map((template) => (
          <EntityCard
            key={template.id}
            title={template.name}
            imageUrl={template.background}
            description={template.content}
            actions={[
              {
                label: "Editar",
                onSelect: () => {
                  setEditing(template)
                  setSheetOpen(true)
                },
              },
              {
                label: "Eliminar",
                destructive: true,
                onSelect: () => setDeleting(template),
              },
            ]}
          />
        ))}
      </CardGrid>

      {dialogs}
    </>
  )
}
