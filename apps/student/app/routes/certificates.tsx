import { getMyCertificates } from "@academy/courses-api/graphql/student-app/queries/certificates"
import { StudentCertificatesPage } from "@academy/student-ui/components/pages/certificates-page"
import {
  certificatesLabels,
  type CertificateView,
} from "@academy/student-ui/types/certificate"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { pickLocale } from "@academy/user-ui/lib/lang"
import { useParams } from "react-router"
import type { Route } from "./+types/certificates"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Certificados" },
    {
      name: "description",
      content:
        "Descarga los certificados de los cursos que has completado en Uspk Academy.",
    },
  ]
}

/**
 * `myCertificates` lazily issues one credential per completed course, so the
 * list is exactly the courses the student has finished. Newest first.
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await getMyCertificates(request)
  const rows = result?.myCertificates ?? []

  const items: CertificateView[] = rows.flatMap((cert) => {
    const course = cert.course
    if (!course) return []
    return [
      {
        id: cert.id,
        courseId: course.id,
        // fullName can be null upstream; the PDF needs a person, not "null".
        studentName: cert.user?.fullName?.trim() || "Estudiante",
        courseTitle: course.title,
        issuedAt: cert.issuedAt ?? "",
        templateName: cert.template?.name ?? null,
      },
    ]
  })

  items.sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  )

  // `?course=<id>` from the course viewer scrolls to and highlights that card.
  const highlightCourseId = new URL(request.url).searchParams.get("course")

  return {
    items,
    highlightCourseId,
    labels: pickLocale(params.lang, certificatesLabels),
  }
}

export default function Certificates({ loaderData }: Route.ComponentProps) {
  const { items, highlightCourseId, labels } = loaderData
  const { lang } = useParams()

  return (
    <StudentCertificatesPage
      items={items}
      labels={labels}
      coursesHref={`/${lang}/dashboard/courses`}
      highlightCourseId={highlightCourseId}
    />
  )
}
