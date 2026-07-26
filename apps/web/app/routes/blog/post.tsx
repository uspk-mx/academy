import { BlogPostPage } from "@academy/user-ui/components/pages/blog-details-page"
import { loadBlogPost, loadBlogPostLabels } from "@academy/cms/loaders/blog-post"
import type { Route } from "./+types/post"

export async function loader({ params: { lang, slug } }: Route.LoaderArgs) {
  const [post, labels] = await Promise.all([
    loadBlogPost(lang, slug),
    loadBlogPostLabels(lang),
  ])
  if (!post) throw new Response("Not Found", { status: 404 })
  return { post, labels }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return <BlogPostPage {...loaderData} />
}
