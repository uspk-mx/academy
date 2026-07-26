import {
  BlogIndexContent,
  BlogPostSummary,
  BrandTone,
} from "@academy/user-ui/types/cms"
import { getBlogPage } from "../graphql/queries/blog"
import { getLocale } from "@academy/user-ui/lib/lang"

export interface BlogIndexData {
  page: BlogIndexContent
  posts: BlogPostSummary[]
}

export async function loadBlogIndex(lang: string): Promise<BlogIndexData> {
  const locale = getLocale(lang)
  const { blogPages, blogPosts } = await getBlogPage({ variables: { locale } })
  const blogPage = blogPages[0]
  return {
    page: {
      title: blogPage.title,
      subtitle: blogPage.subtitle ?? "",
    },
    posts: blogPosts.map((p): BlogPostSummary => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: {
        id: p.categoryId ?? "",
        name: p.categoryName ?? "",
        tone: p.categoryTone as BrandTone,
      },
      publishedAt: p.postDate, // type expects publishedAt, Hygraph has postDate
      authorName: p.authorName ?? "",
      coverImage: {
        alt: p.title,
        url: p.coverImage?.url ?? "",
        height: p.coverImage?.height ?? 300,
        width: p.coverImage?.width ?? 300,
      },
      isNew: p.isNew ?? false,
      featured: p.featured ?? false,
    })),
  }
}
