import {
  BlogIndexContent,
  BlogPostSummary,
  CtaBannerContent,
} from "@academy/user-ui/types/cms"
import { BlogCard, FeaturedPostCard } from "../blog/blog-cards"
import { CtaBanner } from "../marketing/banners"

export interface BlogPageProps {
  content: BlogIndexContent
  posts: BlogPostSummary[]
  ctaBanner: CtaBannerContent
}

export function BlogPage({ content, posts, ctaBanner }: BlogPageProps) {
  const featured = posts.find((post) => post.featured) ?? posts[0]
  const rest = posts.filter((post) => post.id !== featured?.id)

  return (
    <main className="bg-surface-page">
      <div className="mx-auto max-w-page px-page-x py-stack-lg md:py-section-y">
        <header className="text-center">
          <h1 className="text-page-title leading-display font-bold tracking-display">
            {content.title}
          </h1>
          <p className="mt-stack text-sm text-content-muted">
            {content.subtitle}
          </p>
        </header>

        {featured && (
          <FeaturedPostCard post={featured} className="mt-stack-lg" />
        )}

        <div className="mt-section-y grid gap-stack-lg md:grid-cols-2">
          {rest.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <CtaBanner content={ctaBanner} className="mt-section-y" />
    </main>
  )
}
