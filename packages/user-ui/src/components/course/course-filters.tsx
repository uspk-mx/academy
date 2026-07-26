import { cn } from "@academy/user-ui/lib/utils"
import { HardCard, Pill } from "../brand/primitives"
import { Checkbox } from "../ui/checkbox"
import { Slider } from "../ui/slider"
import { CatalogUpsellContent } from "@academy/user-ui/types/cms"
import { BrandButton } from "../brand/brand-button"

export interface FilterOption {
  id: string
  label: string
  /** Result count shown next to the label; omit to hide. */
  count?: number
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  priceLabel?: string;
}

export interface CourseFiltersState {
  /** Selected option ids, keyed by group id. */
  selected: Record<string, string[]>
  maxPrice: number
}

export interface CourseFiltersProps {
  groups: FilterGroup[]
  priceRange: { min: number; max: number }
  priceLabel: FilterGroup['priceLabel'];
  value: CourseFiltersState
  onChange: (next: CourseFiltersState) => void
  onClear: () => void
  className?: string
  /** aria-label for the price slider (CMS). */
  maxPriceAria: string
}

/** Left rail on /cursos. Fully controlled so the route can sync
 *  state to search params and refetch through its loader. */
export function CourseFilters({
  groups,
  priceRange,
  priceLabel,
  value,
  onChange,
  onClear,
  className,
  maxPriceAria,
}: CourseFiltersProps) {
  
  function toggleOption(groupId: string, optionId: string, checked: boolean) {
    const current = value.selected[groupId] ?? []
    onChange({
      ...value,
      selected: {
        ...value.selected,
        [groupId]: checked
          ? [...current, optionId]
          : current.filter((id) => id !== optionId),
      },
    })
  }

  return (
    <HardCard as="aside" className={cn("p-card", className)} shadow="sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-card-title font-bold tracking-tight-brand">
          Filtros
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-content-muted underline underline-offset-4 hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
        >
          Limpiar
        </button>
      </div>

      {groups.map((group) => (
        <fieldset
          key={group.id}
          className="mt-stack-lg border-t border-border-subtle pt-stack"
        >
          <legend className="pb-stack text-label font-bold tracking-tight-brand uppercase">
            {group.label}
          </legend>
          <ul className="flex flex-col gap-3">
            {group.options.map((option) => {
              const inputId = `${group.id}-${option.id}`
              const checked = (value.selected[group.id] ?? []).includes(
                option.id
              )

              return (
                <li key={option.id} className="flex items-center gap-3">
                  <Checkbox
                    id={inputId}
                    checked={checked}
                    onCheckedChange={(state) =>
                      toggleOption(group.id, option.id, state === true)
                    }
                    className="border-2 border-border-strong"
                  />
                  <label
                    htmlFor={inputId}
                    className="flex-1 text-sm font-medium"
                  >
                    {option.label}
                  </label>
                  {typeof option.count === "number" && (
                    <span className="text-sm text-content-muted">
                      {option.count}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </fieldset>
      ))}

      <fieldset className="mt-stack-lg border-t border-border-subtle pt-stack">
        <legend className="pb-stack text-label font-bold tracking-tight-brand uppercase">
          {priceLabel}
        </legend>
        <div className="flex items-center justify-between pb-stack text-sm text-content-muted">
          <span>${priceRange.min}</span>
          <Pill tone="yellow" className="text-label">
            Hasta ${value.maxPrice}
          </Pill>
          <span>${priceRange.max}</span>
        </div>
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={[value.maxPrice]}
          onValueChange={(nextValue) => {
            const maxPrice = Array.isArray(nextValue) ? nextValue[0] : nextValue
            onChange({ ...value, maxPrice })
          }}
          aria-label={maxPriceAria}
        />
      </fieldset>
    </HardCard>
  )
}

export interface CatalogUpsellCardProps {
  content: CatalogUpsellContent
  className?: string
}

/** Black "¿Te gustarían todos los niveles?" card under the filters. */
export function CatalogUpsellCard({
  content,
  className,
}: CatalogUpsellCardProps) {
  return (
    <aside
      className={cn(
        "rounded-card border-2 border-border-strong bg-academy-ink p-card text-content-inverse shadow-hard-sm",
        className
      )}
    >
      <h2 className="text-card-title font-bold tracking-tight-brand">
        {content.title}
      </h2>
      <p className="mt-stack text-sm leading-body text-content-inverse/80">
        {content.description}
      </p>
      <BrandButton
        variant="promo"
        size="sm"
        to={content.cta.href}
        className="mt-stack"
      >
        {content.cta.label}
      </BrandButton>
    </aside>
  )
}
