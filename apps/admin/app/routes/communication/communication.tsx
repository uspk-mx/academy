import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { IconMessage } from "@tabler/icons-react"

export function meta() {
  return [{ title: "USPK Academy | Comunicación" }]
}

/** Placeholder carried over from the previous panel — no API backs it yet. */
export default function CommunicationRoute() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Comunicación" }]} />
      <EmptyState
        icon={<IconMessage className="size-5" />}
        title="Sección en construcción"
        description="Pronto podrás enviar anuncios y correos a los alumnos desde aquí."
      />
    </>
  )
}
