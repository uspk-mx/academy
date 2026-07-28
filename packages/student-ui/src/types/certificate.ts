/**
 * Contracts for the student certificates page and the PDF it generates.
 *
 * The certificate is drawn client-side with `@react-pdf/renderer` from a fixed
 * academy layout (see `components/certificate/certificate-document.tsx`). The
 * template only names the credential today ("por template pero por ahora fijo"),
 * so `CertificateView` carries just what the layout prints: who, which course,
 * and when.
 *
 * Copy follows the repo-wide i18n architecture — every string arrives as a
 * label. `defaultCertificatesLabels` keeps the page working today; swap in a
 * Hygraph model later without touching components.
 */

export interface CertificateView {
  id: string
  /** The course this credential is for — used to deep-link from the viewer. */
  courseId: string
  /** Falls back to the email local-part upstream; may still be empty. */
  studentName: string
  courseTitle: string
  /** ISO timestamp from the API; formatted at the edge (card + PDF). */
  issuedAt: string
  /** The credential's template name, e.g. "Academy". */
  templateName: string | null
}

/** Copy printed onto the PDF itself (fixed academy layout). */
export interface CertificateDocLabels {
  eyebrow: string
  awardedTo: string
  forCompleting: string
  dateLabel: string
  credentialLabel: string
  signatureLabel: string
  brand: string
}

export interface CertificatesPageLabels {
  pageTitle: string
  pageSubtitle: string
  statsTotal: string
  statsThisMonth: string
  issuedOn: string
  download: string
  preview: string
  generating: string
  generationError: string
  emptyTitle: string
  emptyDescription: string
  emptyCta: string
  /** Copy baked into the PDF. */
  doc: CertificateDocLabels
}

export const defaultCertificatesLabels: CertificatesPageLabels = {
  pageTitle: "Mis Certificados",
  pageSubtitle: "Descarga los certificados de los cursos que has completado.",
  statsTotal: "Certificados",
  statsThisMonth: "Este mes",
  issuedOn: "Emitido el",
  download: "Descargar PDF",
  preview: "Vista previa",
  generating: "Generando…",
  generationError: "No se pudo generar el PDF",
  emptyTitle: "Aún no tienes certificados",
  emptyDescription:
    "Completa un curso para obtener tu certificado de finalización.",
  emptyCta: "Ir a mis cursos",
  doc: {
    eyebrow: "Certificado de finalización",
    awardedTo: "Se otorga el presente certificado a",
    forCompleting: "por haber completado exitosamente el curso",
    dateLabel: "Fecha de emisión",
    credentialLabel: "ID de credencial",
    signatureLabel: "Dirección Académica",
    brand: "Uspk Academy",
  },
}

export const certificatesLabels: Record<"es" | "en", CertificatesPageLabels> = {
  es: defaultCertificatesLabels,
  en: {
    pageTitle: "My Certificates",
    pageSubtitle: "Download the certificates for the courses you've completed.",
    statsTotal: "Certificates",
    statsThisMonth: "This month",
    issuedOn: "Issued on",
    download: "Download PDF",
    preview: "Preview",
    generating: "Generating…",
    generationError: "The PDF could not be generated",
    emptyTitle: "You don't have any certificates yet",
    emptyDescription:
      "Complete a course to earn your certificate of completion.",
    emptyCta: "Go to my courses",
    doc: {
      eyebrow: "Certificate of completion",
      awardedTo: "This certificate is awarded to",
      forCompleting: "for successfully completing the course",
      dateLabel: "Issue date",
      credentialLabel: "Credential ID",
      signatureLabel: "Academic Director",
      brand: "Uspk Academy",
    },
  },
}
