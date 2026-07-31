import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { IconChartBar } from "@tabler/icons-react"

export function meta() {
  return [{ title: "USPK Academy | Performance" }]
}

/** Placeholder carried over from the previous panel — no API backs it yet. */
export default function PerformanceRoute() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Performance" }]} />
      <EmptyState
        icon={<IconChartBar className="size-5" />}
        title="Sección en construcción"
        description="Pronto verás el desempeño de cursos y estudiantes en esta sección."
      />
    </>
  )
}
