import { loadCommonLabels } from "@academy/cms/loaders/common-labels"
import { loadCoursesPage } from "@academy/cms/loaders/courses"
import { getCourses } from "@academy/courses-api/graphql/queries/courses"
import { getCategories } from "@academy/courses-api/graphql/queries/categories"
import { getLevels } from "@academy/courses-api/graphql/queries/levels"
import type { FilterGroup } from "@academy/user-ui/components/course/course-filters"
import { CoursePage } from "@academy/user-ui/components/pages/courses-page"
import type { Route } from "./+types/courses"

/** Public URL key for a taxonomy item: its slug, falling back to id when a
 *  slug hasn't been backfilled yet. Keeps raw UUIDs out of the browser. */
function slugKey(item: { id: string; slug?: unknown }) {
  return typeof item.slug === "string" ? item.slug : item.id
}

export async function loader({ request, params: { lang } }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams
  const searchTerm = searchParams.get("q")
  const pageQueryParam = searchParams.get("page")
  const durations = searchParams.getAll("duration")
  const maxPriceParam = searchParams.get("maxPrice")

  // Fetch the filter taxonomies first: the URL carries category/level *slugs*
  // (never raw UUIDs), which we resolve to ids before querying courses.
  const [coursePage, categoriesResult, levelsResult, cardLabels] =
    await Promise.all([
      loadCoursesPage(lang),
      getCategories(request),
      getLevels(request),
      loadCommonLabels(lang),
    ])
  const categories = categoriesResult.getCategories
  const levels = levelsResult.getLevels

  const idBySlug = (items: { id: string; slug?: unknown }[]) =>
    new Map(items.map((item) => [slugKey(item), item.id]))
  const resolveSlugs = (slugs: string[], map: Map<string, string>) =>
    slugs.map((slug) => map.get(slug)).filter((id): id is string => Boolean(id))

  const categoryIds = resolveSlugs(
    searchParams.getAll("category"),
    idBySlug(categories)
  )
  const levelIds = resolveSlugs(searchParams.getAll("level"), idBySlug(levels))

  const { courses } = await getCourses({
    request,
    variables: {
      search: searchTerm,
      limit: 10,
      page: pageQueryParam ? Number.parseInt(pageQueryParam) : null,
      categoryIds: categoryIds.length ? categoryIds : null,
      levelIds: levelIds.length ? levelIds : null,
      durations: durations.length ? durations : null,
      maxPrice: maxPriceParam ? Number.parseInt(maxPriceParam) : null,
    },
  })
  if (!courses) {
    throw new Response("Not Found", { status: 404 })
  }
  return { coursePage, courses, categories, levels, cardLabels }
}

export default function Courses({ loaderData }: Route.ComponentProps) {
  const { hero, upsell, filters, resultsLabel, a11y } = loaderData.coursePage
  const { course: courses, pageInfo, totalCount } = loaderData.courses
  const categories = loaderData.categories
  const levels = loaderData.levels

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: filters.specialtyLabel,
      options: categories
        .filter((item) => item.coursesCount && item.coursesCount > 0)
        .map((category) => ({
          id: slugKey(category),
          label: category.name,
          count: category.coursesCount ?? 0,
        })),
      priceLabel: filters.priceLabel,
    },
    {
      id: "level",
      label: filters.levelLabel,
      options: levels
        .filter((item) => item.coursesCount && item.coursesCount > 0)
        .map((level) => ({
          id: slugKey(level),
          label: level.name,
          count: level.coursesCount ?? 0,
        })),
    },
    {
      id: "duration",
      label: filters.durationLabel,
      options: [
        { id: "lt5", label: filters.durationOptions.short },
        { id: "5-10", label: filters.durationOptions.medium },
        { id: "gt10", label: filters.durationOptions.long },
      ],
    },
  ]

  return (
    <CoursePage
      hero={hero}
      upsell={upsell}
      courses={courses}
      totalCount={totalCount ?? 0}
      filterGroups={filterGroups}
      page={pageInfo.page}
      hasNextPage={pageInfo.hasNextPage}
      resultsLabel={resultsLabel}
      a11y={a11y}
      cardLabels={loaderData.cardLabels}
    />
  )
}
