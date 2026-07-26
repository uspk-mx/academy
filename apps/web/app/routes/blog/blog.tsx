import { loadBlogIndex } from "@academy/cms/loaders/blog"
import { loadCtaBanner } from "@academy/cms/loaders/cta-banner"
import { BlogPage } from "@academy/user-ui/components/pages/blog-page"
import type { Route } from "./+types/blog"

export async function loader({ params: { lang } }: Route.LoaderArgs) {
  const [blog, ctaBanner] = await Promise.all([
    loadBlogIndex(lang),
    loadCtaBanner({ lang }),
  ])
  return { ...blog, ctaBanner }
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  return (
    <BlogPage
      content={loaderData.page}
      posts={loaderData.posts}
      ctaBanner={loaderData.ctaBanner}
    />
  )
}
