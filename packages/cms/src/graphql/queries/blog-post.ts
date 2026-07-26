import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const BLOG_POST_QUERY = graphql(`
  query GetBlogPost($slug: String!, $locale: Locale!) {
    blogPost(where: { slug: $slug }, locales: [$locale, en]) {
      id
      slug
      title
      categoryName
      categoryId
      categoryTone
      postDate
      authorName
      blocks {
        ... on BlockEmbed {
          __typename
          id
          height
          caption
          embedUrl
        }
        ... on BlockImage {
          __typename
          id
          alt
          fullWidth
          image {
            height
            fileName
            id
            size
            url
            width
            mimeType
          }
        }
        ... on BlockVideo {
          __typename
          id
          url
          caption
          publishedAt
          videoFile {
            id
            width
            height
            url
            fileName
            mimeType
            size
          }
        }
      }
      coverImage {
        url
        size
        height
        width
      }
      isNew
      featured
      body {
        __typename
        raw
      }
    }
  }
`)

export type BlogPostPageData = ResultOf<typeof BLOG_POST_QUERY>
export type BlogPostPageVariables = VariablesOf<typeof BLOG_POST_QUERY>

export async function getBlogPostPage({
  variables,
}: {
  variables: BlogPostPageVariables
}): Promise<BlogPostPageData> {
  return cmsAPIClient(BLOG_POST_QUERY, variables)
}
