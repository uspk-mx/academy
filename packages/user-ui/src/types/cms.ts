/**
 * CMS-driven content types (Hygraph).
 * Everything here is editorial content: copy, images, marketing blocks.
 * Course data, auth and user state live in `types/api.ts`.
 */

/** A title split into segments so editors can mark accent words
 *  (rendered in Fraunces italic + brand color, e.g. "Aprende *inglés*"). */
export interface TitleSegment {
  text: string
  accent?: boolean
}

export interface CmsImage {
  url: string
  alt: string
  width?: number
  height?: number
}

export interface CmsLink {
  label: string
  href: string
}

/* ---------------------------------- Home ---------------------------------- */

export interface HomeHeroContent {
  title: TitleSegment[]
  subtitle: string
  primaryCta: CmsLink
  secondaryCta: CmsLink
  disclaimer?: string
  image: CmsImage
  /** Floating "unit" teaser card under the hero (Unit 3 …). */
  unitTeaser?: UnitTeaserContent
}

export interface UnitTeaserContent {
  unitLabel: string // "Unit 3"
  title: string // "¿Qué tienda recomiendas?"
  description: string
  streakLabel?: string // "7 lecciones seguidas"
  characterImage?: CmsImage
}

export type BrandTone = "yellow" | "blue" | "green" | "coral"

export interface FeatureItem {
  id: string
  /** Tiny uppercase label above the title, e.g. "10 MIN / DÍA". */
  eyebrow: string
  title: string
  description: string
  /** lucide icon name resolved by the FeatureCard. */
  icon: "zap" | "bar-chart" | "globe" | "award" | "headphones"
  tone: BrandTone
}

export interface FeaturesSectionContent {
  eyebrow: string // "¿Cómo funciona?"
  title: TitleSegment[]
  items: FeatureItem[]
}

export interface PricingSectionContent {
  eyebrow: string // "Precios"
  title: TitleSegment[]
  subtitle?: string
  plans: PricingPlanContent[]
  showPricingSection?: boolean
}

/** Marketing copy for a plan. Actual live prices could later be
 *  overridden from the API; shape kept flat for the CMS. */
export interface PricingPlanContent {
  id: string
  name: string // "Gratis" | "Pro" | …
  price: string // "$0" | "$199"
  priceSuffix: string // "/ siempre" | "MXN por mes"
  features: string[]
  cta: CmsLink
  ctaTone?: "blue" | "yellow"
  highlighted?: boolean
  highlightLabel?: string // "El más popular"
}

export interface Testimonial {
  quote: string
  /** Optional trailing emphasis, e.g. "Vale cada peso." */
  quoteEmphasis?: string
  authorName: string
  authorRole: string
  avatar?: CmsImage
  showTestimonialsSection?: boolean
}

export interface LogoStripContent {
  title: string // "Equipos que ya están aprendiendo"
  logos: CmsImage[]
  showCompaniesSection?: boolean
}

/* --------------------------------- Cursos --------------------------------- */

 
/** Decorative category card in the catalog hero: tone-colored card with an
 *  inner soft panel holding the illustration, label below. */
export interface CatalogCategoryCard {
  label: string // "Enfermería"
  tone: BrandTone
  image: CmsImage // 3D illustration shown inside the inner panel
  url: string
  alt: string
}
 
export interface CatalogHeroContent {
  promoBadge?: string; // "Verano 2026 · Hasta 45% OFF"
  title: TitleSegment[];
  subtitle: string;
  searchPlaceholder: string;
  cards?: CatalogCategoryCard[]; // decorative scattered category cards
}

export interface CatalogUpsellContent {
  title: string // "¿Te gustarían todos los niveles?"
  description: string
  cta: CmsLink
}

/* -------------------------------- Nosotros -------------------------------- */

export interface AboutContent {
  title: string
  body: string
  image: CmsImage
  founderQuote: { quote: string; attribution: string }
  history: { title: string; body: string }
  mission: { title: string; body: string }
  audience: AudienceSectionContent
  team: TeamSectionContent
}

export interface AudienceSegment {
  id: string
  title: string
  description: string
  tone: BrandTone
}

export interface AudienceSectionContent {
  title: string
  description: string
  segments: AudienceSegment[]
}

export interface TeamMember {
  id: string
  name: string
  role?: string
  photo?: CmsImage
  tone: BrandTone
}

export interface TeamSectionContent {
  title: string
  members: TeamMember[]
}

export interface CtaBannerContent {
  headlineLines: string[] // ["Upskill.", "Onboard.", "Lead.", "Repeat."]
  description: string
  primaryCta: CmsLink
  secondaryCta: CmsLink
  portraits?: CmsImage[]
}

/* ---------------------------------- Blog ---------------------------------- */

export interface BlogCategory {
  id: string
  name: string
  tone: BrandTone
}

export interface BlogPostSummary {
  id: string
  slug: string
  title: string
  category: BlogCategory
  publishedAt: string // ISO date
  authorName: string
  coverImage: CmsImage
  isNew?: boolean
  featured?: boolean
}

// export type BlogBlock =
//   | { type: "heading"; text: string }
//   | { type: "paragraph"; text: string }
//   | { type: "list"; items: string[] }
//   | { type: "image"; image: CmsImage }
//   | { type: "pullQuote"; text: string }

  /**
 * Hygraph rich text field payload. `json` is the AST consumed by
 * @graphcms/rich-text-react-renderer (RichTextContent).
 */
export interface RichTextField {
  json: unknown; // RichTextContent from @graphcms/rich-text-types
}
 
/**
 * Modular `blocks` union from the v3 schema, discriminated by __typename
 * exactly as Hygraph returns it. Custom blocks (embed/image/video) break out
 * of the reading flow; everything else is rich text.
 */
export type BlogBlock =
  | {
      __typename: "BlockRichText" // adjust if the model is named differently
      id: string
      content: RichTextField
    }
  | {
      __typename: "BlockEmbed"
      id: string
      height: number | null
      caption: string | null
      embedUrl: string
    }
  | {
      __typename: "BlockImage"
      id: string
      alt: string | null
      fullWidth: boolean
      image: CmsImage
    }
  | {
      __typename: "BlockVideo"
      id: string
      url: string
      caption: string | null
      publishedAt: string | null
      videoFile?: {
        id: string
        width: string | null
        height: string | null
        url: string
        fileName: string
        mimeType: string
        size: string | null
      }
    }

export interface BlogPostDetail extends BlogPostSummary {
  body: { __typename?: "RichText"; raw: unknown }
  blocks: BlogBlock[]
}

export interface BlogIndexContent {
  title: string // "Explore Articles"
  subtitle: string
}


