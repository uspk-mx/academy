// Dev-only helper to preview the certificate PDF (and its logo) without having
// to complete a course. Renders the real CertificateActions with mock data, so
// what you see here is exactly what students get. 404s outside dev.
// Use the lazy wrapper (not CertificateActions directly) so this dev route
// doesn't statically pull the heavy @react-pdf chunk and defeat its splitting.
import { LazyCertificateDownload } from "@academy/student-ui/components/certificate/certificate-download-lazy"
import {
  defaultCertificatesLabels,
  type CertificateView,
} from "@academy/student-ui/types/certificate"

export function loader() {
  if (!import.meta.env.DEV) {
    throw new Response("Not Found", { status: 404 })
  }
  return null
}

export function meta() {
  return [{ title: "Certificate preview (dev)" }]
}

const mockCert: CertificateView = {
  id: "preview",
  courseId: "preview",
  studentName: "Alvaro Castillo",
  courseTitle: "Fundamentos de Enfermería",
  issuedAt: new Date().toISOString(),
  templateName: "Academy",
}

export default function CertPreview() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-bold">Certificate preview (dev)</h1>
        <p className="mt-1 text-sm text-content-muted">
          Usa “{defaultCertificatesLabels.preview}” para verlo, o “
          {defaultCertificatesLabels.download}” para el PDF. Data de ejemplo.
        </p>
      </div>
      <LazyCertificateDownload cert={mockCert} labels={defaultCertificatesLabels} />
    </main>
  )
}
