import { z } from "zod"

const brandToneSchema = z.enum(["yellow", "blue", "green", "coral"])

export const navLinksJsonSchema = z.array(
  z.object({
    id: z.string().optional(),
    label: z.string(),
    href: z.string(),
    order: z.number().nullish(),
    external: z.boolean().nullish(),
  })
)

export const footerColumnsJsonSchema = z.array(
  z.object({
    id: z.string().optional(),
    title: z.string(),
    order: z.number().nullish(),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    ),
  })
)

export const featureCardsJsonSchema = z.array(
  z.object({
    id: z.string().optional(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.enum([
      "zap",
      "bar_chart",
      "bar-chart",
      "globe",
      "award",
      "headphones",
    ]),
    tone: brandToneSchema,
    order: z.number().nullish(),
  })
)

export const pricingPlansJsonSchema = z.array(
  z.object({
    id: z.string().optional(),
    name: z.string(),
    price: z.string(),
    priceSuffix: z.string(),
    features: z
      .array(z.string())
      .nullish()
      .transform((features) => features ?? []),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    ctaTone: z.enum(["blue", "yellow"]).nullish(),
    highlighted: z.boolean().nullish(),
    highlightLabel: z.string().nullish(),
    order: z.number().nullish(),
  })
)

export const audienceCardsJsonSchema = z.array(
  z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    tone: brandToneSchema,
    order: z.number().nullish(),
  })
)

export function parseJsonField<T>(
  schema: z.ZodType<T>,
  value: unknown,
  fieldName: string
): T {
  const result = schema.safeParse(value ?? [])

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => issue.path.join(".") + ": " + issue.message)
      .join("; ")
    throw new Error("Invalid Hygraph JSON field " + fieldName + ": " + details)
  }

  return result.data
}

export function jsonItemId(
  prefix: string,
  item: { id?: string; order?: number | null },
  index: number
): string {
  return item.id ?? prefix + "-" + (item.order ?? index + 1)
}
