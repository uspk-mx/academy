import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const BLOG_INDEX_QUERY = graphql(`
  query GetBlogPage($locale: Locale!) {
    blogPages(locales: [$locale, en]) {
      byLabel
      shareAria
      title
      subtitle
    }
    blogPosts(
      locales: [$locale, en]
      where: { published: true }
      orderBy: postDate_DESC
    ) {
      id
      slug
      title
      categoryName
      categoryId
      categoryTone
      postDate
      authorName
      coverImage {
        url
        size
        height
        width
      }
      isNew
      featured
    }
  }
`)

export type BlogPageData = ResultOf<typeof BLOG_INDEX_QUERY>
export type BlogPageVariables = VariablesOf<typeof BLOG_INDEX_QUERY>

export async function getBlogPage({
  variables,
}: {
  variables: BlogPageVariables
}): Promise<BlogPageData> {
  return cmsAPIClient(BLOG_INDEX_QUERY, variables)
}
