/**
 * Shared commerce strings (course cards) — fetched from the Hygraph
 * `CommonLabels` model, falling back to the component defaults.
 */
import type { CourseCardLabels } from "@academy/user-ui/components/course/course-card"
import { defaultCourseCardLabels } from "@academy/user-ui/components/course/course-card"
import { getLocale } from "@academy/user-ui/lib/lang"
import { getCommonLabels } from "../graphql/queries/common-labels"
import { fillLabels } from "./label-utils"

export type { CourseCardLabels }

export async function loadCommonLabels(
  lang: string
): Promise<CourseCardLabels> {
  const locale = getLocale(lang)
  try {
    const { commonLabelsList } = await getCommonLabels({
      variables: { locale },
    })
    return fillLabels(
      defaultCourseCardLabels,
      (commonLabelsList[0] ?? null) as Record<string, unknown> | null
    )
  } catch {
    return defaultCourseCardLabels
  }
}
