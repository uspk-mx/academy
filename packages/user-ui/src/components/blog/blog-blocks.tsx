import { BlogBlock } from "@academy/user-ui/types/cms"
import { HardCard } from "../brand/primitives"
import { RichText } from "@graphcms/rich-text-react-renderer"
import type { ElementNode, RichTextContent } from "@graphcms/rich-text-types"

/**
 * Element renderers for Hygraph rich text, styled with the design tokens.
 * blockquote maps to the blue pull-quote treatment from the Canva design.
 */
export const richTextRenderers = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-section-title leading-display font-bold tracking-display [&:not(:first-child)]:mt-stack-lg">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-stack text-card-title leading-display font-bold tracking-tight-brand">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mt-stack text-sm leading-body text-content-primary/85">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mt-stack flex list-disc flex-col gap-1.5 pl-5 text-sm leading-body text-content-primary/85">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mt-stack flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-body text-content-primary/85">
      {children}
    </ol>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mt-stack rounded-card border-2 border-border-strong bg-academy-blue p-card text-lg leading-body font-bold tracking-tight-brand text-content-inverse shadow-hard-sm">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a
      href={href}
      className="font-bold text-action-secondary underline underline-offset-2 hover:no-underline"
    >
      {children}
    </a>
  ),
}

/**
 * Splits the body AST into sections at heading-two boundaries so each
 * section renders inside its own hard-shadow card, matching the Canva
 * layout — without flattening the AST (marks/links/nesting preserved).
 */
export function splitBodyIntoSections(raw: unknown): ElementNode[][] {
  const children = (raw as { children?: ElementNode[] })?.children ?? []
  const sections: ElementNode[][] = []

  for (const node of children) {
    if (node.type === "heading-two" || sections.length === 0) {
      sections.push([node])
    } else {
      sections[sections.length - 1].push(node)
    }
  }

  return sections
}

/**
 * Normalizes editor-pasted YouTube/Vimeo URLs into embeddable URLs.
 * Returns null when the URL isn't a recognized provider.
 */
export function getVideoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
 
    if (host === "youtube.com" || host === "m.youtube.com") {
      // watch?v=ID | shorts/ID | embed/ID | live/ID
      const id =
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.match(/(\d{6,})/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Renders one member of the `blocks` union, discriminated by __typename. */
export function BlogBlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.__typename) {
    case "BlockRichText":
      return (
        <HardCard as="section" className="p-card sm:p-stack-lg">
          <RichText
            content={block.content.json as RichTextContent}
            renderers={richTextRenderers}
          />
        </HardCard>
      )

    case "BlockImage":
      return (
        <figure
          className={block.fullWidth ? "w-full" : "mx-auto w-full max-w-lg"}
        >
          <img
            src={block.image.url}
            alt={block.alt ?? ""}
            width={block.image.width}
            height={block.image.height}
            loading="lazy"
            className="w-full rounded-card-lg border-2 border-border-strong object-cover shadow-hard-sm"
          />
        </figure>
      )

    case "BlockVideo":
           const embedUrl = block.url ? getVideoEmbedUrl(block.url) : null;

      return (
        <figure className="w-full">
          {block.videoFile ? (
            // Hosted file in Hygraph assets > native player
            <video
              src={block.videoFile.url}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-card-lg border-2 border-border-strong bg-academy-ink object-cover shadow-hard-sm"
            />
          ) : embedUrl ? (
            // YouTube / Vimeo > provider iframe
            <iframe
              src={embedUrl}
              title={block.caption ?? "Video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full rounded-card-lg border-2 border-border-strong bg-academy-ink shadow-hard-sm"
            />
          ) : block.url ? (
            // Unrecognized provider > plain link fallback
            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-card-lg border-2 border-border-strong bg-surface-card p-card text-sm font-bold text-action-secondary underline underline-offset-2 shadow-hard-sm hover:no-underline"
            >
              Ver video
            </a>
          ) : null}
          {block.caption && (
            <figcaption className="mt-2 text-center text-label text-content-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    case "BlockEmbed":
      return (
        <figure className="w-full">
          <iframe
            src={block.embedUrl}
            title={block.caption ?? "Contenido incrustado"}
            height={block.height ?? 400}
            loading="lazy"
            allowFullScreen
            className="w-full rounded-card-lg border-2 border-border-strong bg-surface-card shadow-hard-sm"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-label text-content-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}
