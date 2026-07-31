import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { IconAward } from "@tabler/icons-react"

export function meta() {
  return [{ title: "USPK Academy | Certificados" }]
}

/**
 * Certificates are issued lazily by the API when a student finishes a course,
 * so there is nothing to administer yet — only the templates they render with.
 */
export default function CertificatesRoute() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Certificados" }]} />
      <EmptyState
        icon={<IconAward className="size-5" />}
        title="Los certificados se emiten automáticamente"
        description="Cuando un alumno completa un curso, su certificado se genera solo. Aquí administras las plantillas con las que se imprimen."
        actionLabel="Ver plantillas"
        href="/certificates/templates"
      />
    </>
  )
}
