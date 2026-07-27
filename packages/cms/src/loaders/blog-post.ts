import {
  BlogBlock,
  BlogPostDetail,
  BrandTone,
} from "@academy/user-ui/types/cms"
import { getBlogPage } from "../graphql/queries/blog"
import { getBlogPostPage } from "../graphql/queries/blog-post"
import { getLocale } from "@academy/user-ui/lib/lang"

export interface BlogPostLabels {
  byLabel: string
  shareAria: string
}

export const defaultBlogPostLabels: BlogPostLabels = {
  byLabel: "Por",
  shareAria: "Compartir artículo",
}

/** Fetched from the Hygraph BlogPage model (shared across post pages). */
export async function loadBlogPostLabels(
  lang: string
): Promise<BlogPostLabels> {
  const locale = getLocale(lang)
  try {
    const { blogPages } = await getBlogPage({ variables: { locale } })
    const page = blogPages[0]
    return {
      byLabel: page?.byLabel ?? defaultBlogPostLabels.byLabel,
      shareAria: page?.shareAria ?? defaultBlogPostLabels.shareAria,
    }
  } catch {
    return defaultBlogPostLabels
  }
}

export async function loadBlogPost(
  lang: string,
  slug: string
): Promise<BlogPostDetail | null> {
  const locale = getLocale(lang)
  const data = await getBlogPostPage({
    variables: {
      slug,
      locale,
    },
  })

  if (!data.blogPost) return null
  const p = data.blogPost

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: {
      id: p.categoryId ?? "",
      name: p.categoryName ?? "",
      tone: p.categoryTone as BrandTone,
    },
    body: p.body as any,
    publishedAt: p.postDate,
    authorName: p.authorName ?? "",
    coverImage: {
      alt: p.title,
      height: p.coverImage?.height ?? 300,
      width: p.coverImage?.width ?? 400,
      url: p.coverImage?.url ?? "",
    },
    isNew: p.isNew ?? false,
    featured: p.featured ?? false,
    blocks: p.blocks as any
  }
}
