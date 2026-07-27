import { RichText } from "@graphcms/rich-text-react-renderer"
import { RichTextContent } from "@graphcms/rich-text-types"
import { richTextRenderers } from "../../blog/blog-blocks"
import { formatDate } from "../../blog/blog-cards"
import { HardCard } from "../../brand/primitives"

export interface TermsPageProps {
  heading: string
  lastUpdatedLabel: string
  lastUpdated: string
  body: { __typename?: "RichText"; raw: unknown }
}

export function TermsPage({
  heading,
  lastUpdatedLabel,
  lastUpdated,
  body,
}: TermsPageProps) {
  return (
    <main className="bg-surface-page">
      <header className="relative">
        <div className="relative mx-auto max-w-reading px-page-x">
          <div className="mt-10 rounded-card-lg border-2 border-border-strong bg-academy-yellow shadow-hard-md">
            <h1 className="p-card text-center text-section-title leading-display font-bold tracking-display sm:p-stack-lg">
              {heading}
            </h1>
            <div className="flex items-center justify-start gap-x-2 border-t-2 border-border-strong px-card py-3 text-label">
              <span className="font-bold">{lastUpdatedLabel}</span>
              <div className="flex items-center gap-3">
                <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
              </div>
            </div>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-page space-y-14 px-page-x py-10">
        <HardCard as="section" className="p-card sm:p-stack-lg">
          <RichText
            content={body.raw as RichTextContent}
            renderers={richTextRenderers}
          />
        </HardCard>
      </article>
    </main>
  )
}
