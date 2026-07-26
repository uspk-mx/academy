import { BlogPostDetail } from "@academy/user-ui/types/cms"
import { formatDate } from "../blog/blog-cards"
import { IconShare2 } from "@tabler/icons-react"
import { BlogBlockRenderer, richTextRenderers, splitBodyIntoSections } from "../blog/blog-blocks"
import { HardCard } from "../brand/primitives"
import { RichText } from "@graphcms/rich-text-react-renderer"
import { RichTextContent } from "@graphcms/rich-text-types"

export interface BlogPostPageProps {
  post: BlogPostDetail
  onShare?: (slug: string) => void
  labels: {
    byLabel: string
    shareAria: string
  }
}

export function BlogPostPage({ post, onShare, labels }: BlogPostPageProps) {
  return (
    <main className="bg-surface-page">
      <header className="relative">
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          className="h-64 w-full border-b-2 border-border-strong object-cover sm:h-80"
        />
        <div className="relative mx-auto max-w-reading px-page-x">
          <div className="-mt-20 rounded-card-lg border-2 border-border-strong bg-academy-yellow shadow-hard-md">
            <h1 className="p-card text-center text-section-title leading-display font-bold tracking-display sm:p-stack-lg">
              {post.title}
            </h1>
            <div className="flex items-center justify-between border-t-2 border-border-strong px-card py-3 text-label">
              <p>
                {labels.byLabel}{" "}
                <span className="font-bold">{post.authorName}</span>
              </p>
              <div className="flex items-center gap-3">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                {onShare && (
                  <button
                    type="button"
                    onClick={() => onShare(post.slug)}
                    aria-label={labels.shareAria}
                    className="rounded-sm p-1 hover:bg-academy-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                  >
                    <IconShare2 aria-hidden className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-reading px-page-x py-section-y space-y-14">
        {splitBodyIntoSections(post.body.raw).map((section, i) => (
          <HardCard key={i} as="section" className="p-card sm:p-stack-lg">
            <RichText
              content={section as RichTextContent}
              renderers={richTextRenderers}
            />
          </HardCard>
        ))}

        {post.blocks.map((block) => (
          <BlogBlockRenderer key={block.id} block={block} />
        ))}
      </article>
    </main>
  )
}
