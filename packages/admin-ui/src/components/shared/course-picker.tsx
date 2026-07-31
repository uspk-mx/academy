import { IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import { Pill } from "@academy/user-ui/components/brand/primitives"
import { Checkbox } from "@academy/user-ui/components/ui/checkbox"
import { Input } from "@academy/admin-ui/components/ui/input"

export interface CourseOption {
  id: string
  title: string
  featuredImage?: string | null
}

/**
 * Multi-select over the course catalogue, used by bundles, learning paths and
 * prerequisites. Selection is submitted as repeated `name` inputs so the form
 * posts a plain string[] with no client state to serialise.
 */
export function CoursePicker({
  courses,
  name,
  defaultSelectedIds = [],
  excludeId,
  emptyMessage = "No hay cursos disponibles.",
}: {
  courses: CourseOption[]
  /** Form field name; one hidden input is emitted per selected course. */
  name: string
  defaultSelectedIds?: string[]
  /** Keeps a course from listing itself (prerequisites). */
  excludeId?: string
  emptyMessage?: string
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelectedIds)
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return courses.filter(
      (course) =>
        course.id !== excludeId &&
        (!needle || course.title.toLowerCase().includes(needle))
    )
  }, [courses, query, excludeId])

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    )

  return (
    <div className="space-y-2">
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <div className="relative">
        <IconSearch className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-muted" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cursos..."
          className="pl-10"
          aria-label="Buscar cursos"
        />
      </div>

      <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-card border-2 border-border-strong bg-surface-card p-1.5 shadow-hard-xs">
        {visible.length === 0 ? (
          <p className="p-3 text-sm text-content-muted">{emptyMessage}</p>
        ) : (
          visible.map((course) => (
            <label
              key={course.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-[calc(var(--radius-card)-6px)] p-2 text-sm transition-colors hover:bg-academy-yellow-soft"
            >
              <Checkbox
                checked={selected.includes(course.id)}
                onCheckedChange={() => toggle(course.id)}
              />
              {course.featuredImage && (
                <img
                  src={course.featuredImage}
                  alt=""
                  className="size-9 shrink-0 rounded-[calc(var(--radius-card)-8px)] border-2 border-border-strong object-cover"
                />
              )}
              <span className="line-clamp-1 font-semibold">{course.title}</span>
            </label>
          ))
        )}
      </div>

      <Pill tone="white" className="text-label">
        {selected.length} seleccionados
      </Pill>
    </div>
  )
}
