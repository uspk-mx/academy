import { getMyCertificates } from "@academy/courses-api/graphql/student-app/queries/certificates"

/**
 * Whether the student holds a certificate for this course.
 *
 * `myCertificates` lazily issues one per completed course (keyed on the stored
 * `course_progress.completed` column), so its presence is the authoritative
 * "course completed" signal. The GraphQL `course.progress` field comes back
 * null through the `course(id)` query the viewer uses, so it can't gate this.
 * The query pulls no PDF code, so the viewer stays light.
 */
export async function hasCourseCertificate(
  request: Request,
  courseId: string
): Promise<boolean> {
  const result = await getMyCertificates(request)
  return (result?.myCertificates ?? []).some(
    (cert) => cert.course?.id === courseId
  )
}
