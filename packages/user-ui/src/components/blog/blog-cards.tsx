import { cn } from "@academy/user-ui/lib/utils"
import { BlogPostSummary, BrandTone } from "@academy/user-ui/types/cms"
import { Link, useParams } from "react-router"
import { Pill, toneBg, toneFg } from "../brand/primitives"
import { FloatingPills } from "../marketing/home-hero"

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

export function FeaturedPostCard({
  post,
  className,
}: {
  post: BlogPostSummary
  className?: string
}) {
  const { lang } = useParams()
  return (
    <article
      className={cn(
        "relative grid items-center gap-stack-lg rounded-card-lg border-2 border-border-strong bg-academy-yellow-soft p-card shadow-hard-md sm:p-stack-lg md:grid-cols-2",
        className
      )}
    >
      <div className="flex flex-col items-start gap-stack">
        {post.isNew && <Pill tone="blue">{lang === 'en' ? "New" : "Nuevo"}</Pill>}
        <h2 className="text-section-title leading-display font-bold tracking-display">
          <Link
            to={`/${lang}/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h2>
        <div className="flex w-full flex-wrap items-center justify-between gap-stack">
          <Pill tone="yellow">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </Pill>
          <p className="text-label">
            By <span className="font-bold">{post.authorName}</span>
          </p>
        </div>
      </div>

      <div className="relative">
        <FloatingPills
          positions={[
            { tone: "coral", className: "-top-3 right-10" },
            { tone: "green", className: "top-1/2 -left-4" },
            { tone: "blue", className: "-right-3 bottom-10" },
            { tone: "yellow", className: "-bottom-3 left-1/3" },
          ]}
        />
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          className="aspect-4/3 w-full rounded-card border-2 border-border-strong object-cover"
        />
      </div>
    </article>
  )
}

export function BlogCard({
  post,
  className,
}: {
  post: BlogPostSummary
  className?: string
}) {
  const tone: BrandTone = post.category.tone
  const { lang } = useParams()
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-card border-2 border-border-strong shadow-hard-sm",
        toneBg[tone],
        className
      )}
    >
      <div className={cn("flex flex-col gap-stack p-card-sm", toneFg[tone])}>
        <div className="flex items-center justify-between gap-2">
          <Pill>{post.category.name}</Pill>
          <Pill>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </Pill>
        </div>
        <h3 className="text-card-title leading-snug font-bold tracking-tight-brand text-academy-ink">
          <Link
            to={`/${lang}/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className="self-end text-label">
          By <span className="font-bold">{post.authorName}</span>
        </p>
      </div>
      <div className="bg-academy-white p-4">
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          loading="lazy"
          className="aspect-3/2 w-full border-t-2 border-border-strong object-cover rounded-2xl"
        />
      </div>
    </article>
  )
}
