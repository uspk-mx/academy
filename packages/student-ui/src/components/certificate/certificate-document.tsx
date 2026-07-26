/**
 * The academy certificate, drawn with `@react-pdf/renderer` primitives.
 *
 * One fixed landscape layout ("por template pero por ahora fijo") in the
 * academy visual language: cream page, hard black frame with an offset shadow,
 * a yellow eyebrow pill and seal, Fraunces for display and DM Sans for the rest.
 * The template only names the credential today, so the layout prints the three
 * things a certificate needs: recipient, course, and issue date.
 *
 * Rendering is client-only (see `certificate-actions.tsx`); `Font.register`
 * runs at import time but only stores URLs — the fonts are fetched from the
 * app's `public/fonts` when the browser actually renders the PDF.
 */
import {
  Document,
  Font,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer"
import type { CertificateDocLabels, CertificateView } from "../../types/certificate"

// Academy palette (literal hex — @react-pdf can't read CSS custom properties).
const CREAM = "#FEFAF0"
const YELLOW = "#FFD123"
const INK = "#000000"
const MUTED = "#565049"
const FAINT = "#8C857C"

// Served from apps/student/public/fonts. Absolute paths so they resolve under
// any locale-prefixed route; static TTF because @react-pdf can't parse the
// woff2 variable fonts @fontsource ships.
Font.register({
  family: "DM Sans",
  fonts: [
    { src: "/fonts/dm-sans-400.ttf", fontWeight: 400 },
    { src: "/fonts/dm-sans-500.ttf", fontWeight: 500 },
    { src: "/fonts/dm-sans-700.ttf", fontWeight: 700 },
  ],
})
Font.register({
  family: "Fraunces",
  fonts: [{ src: "/fonts/fraunces-600.ttf", fontWeight: 600 }],
})
// Names and course titles are proper nouns — never hyphenate them mid-word.
Font.registerHyphenationCallback((word) => [word])

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Mexico_City",
})

function formatIssueDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    fontFamily: "DM Sans",
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 40,
    paddingBottom: 40,
  },
  frameWrap: { flexGrow: 1, position: "relative" },
  shadow: {
    position: "absolute",
    top: 9,
    left: 9,
    right: -9,
    bottom: -9,
    backgroundColor: INK,
    borderRadius: 12,
  },
  frame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CREAM,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: INK,
    borderStyle: "solid",
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  // Full wordmark logo (239x41 source) — dimensions keep the exact aspect ratio.
  brandLogo: { width: 152, height: 26 },
  brandTile: {
    width: 24,
    height: 24,
    backgroundColor: YELLOW,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: "solid",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTileText: { fontFamily: "Fraunces", fontSize: 13, color: INK },
  brandText: {
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 2,
    color: INK,
  },
  eyebrow: {
    marginTop: 20,
    backgroundColor: YELLOW,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: "solid",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 14,
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 8.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: INK,
  },
  awardedTo: {
    marginTop: 26,
    fontFamily: "DM Sans",
    fontSize: 11,
    color: MUTED,
  },
  name: {
    marginTop: 8,
    fontFamily: "Fraunces",
    fontWeight: 600,
    fontSize: 36,
    color: INK,
    textAlign: "center",
  },
  nameRule: {
    marginTop: 8,
    width: 150,
    height: 6,
    backgroundColor: YELLOW,
    borderRadius: 3,
  },
  forCompleting: {
    marginTop: 22,
    fontFamily: "DM Sans",
    fontSize: 11,
    color: MUTED,
  },
  course: {
    marginTop: 8,
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 20,
    color: INK,
    textAlign: "center",
    maxWidth: 560,
    lineHeight: 1.25,
  },
  footer: {
    marginTop: "auto",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  footerCol: { width: 180 },
  footerColRight: { width: 180, alignItems: "flex-end" },
  metaLabel: {
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: FAINT,
  },
  metaValue: {
    marginTop: 3,
    fontFamily: "DM Sans",
    fontWeight: 500,
    fontSize: 11,
    color: INK,
  },
  seal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: YELLOW,
    borderWidth: 2.5,
    borderColor: INK,
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
  },
  signatureName: {
    fontFamily: "Fraunces",
    fontWeight: 600,
    fontSize: 14,
    color: INK,
  },
  signatureRule: {
    marginTop: 4,
    width: 150,
    height: 1.5,
    backgroundColor: INK,
  },
  signatureLabel: {
    marginTop: 4,
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: FAINT,
    textAlign: "right",
  },
  credential: {
    marginTop: 18,
    fontFamily: "DM Sans",
    fontSize: 7.5,
    letterSpacing: 0.5,
    color: FAINT,
  },
})

export interface CertificateDocumentProps {
  cert: CertificateView
  labels: CertificateDocLabels
}

export function CertificateDocument({ cert, labels }: CertificateDocumentProps) {
  const issued = formatIssueDate(cert.issuedAt)
  return (
    <Document
      title={`${labels.brand} — ${cert.courseTitle}`}
      author={labels.brand}
      subject={labels.eyebrow}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frameWrap}>
          <View style={styles.shadow} />
          <View style={styles.frame}>
            <View style={styles.brandRow}>
              <Image src="/img/certificate-logo.png" style={styles.brandLogo} />
            </View>

            <Text style={styles.eyebrow}>{labels.eyebrow}</Text>

            <Text style={styles.awardedTo}>{labels.awardedTo}</Text>
            <Text style={styles.name}>{cert.studentName}</Text>
            <View style={styles.nameRule} />

            <Text style={styles.forCompleting}>{labels.forCompleting}</Text>
            <Text style={styles.course}>{cert.courseTitle}</Text>

            <View style={styles.footer}>
              <View style={styles.footerCol}>
                <Text style={styles.metaLabel}>{labels.dateLabel}</Text>
                <Text style={styles.metaValue}>{issued}</Text>
              </View>

              <View style={styles.seal}>
                <Svg width={30} height={30} viewBox="0 0 24 24">
                  <Path
                    d="M20 6 L9 17 L4 12"
                    stroke={INK}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>

              <View style={styles.footerColRight}>
                <Text style={styles.signatureName}>{labels.brand}</Text>
                <View style={styles.signatureRule} />
                <Text style={styles.signatureLabel}>
                  {labels.signatureLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.credential}>
              {labels.credentialLabel} · {cert.id}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
