import { cn } from "@academy/user-ui/lib/utils"
import { IconSearch, IconX } from "@tabler/icons-react"
import { Command } from "cmdk"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { getStudentNavItems, type StudentNavItem } from "../lib/nav-items"
import type { StudentLayoutLabels } from "../types/layout"

export interface CommandMenuProps {
  isOpen: boolean
  onClose: () => void
  labels: StudentLayoutLabels
  onLogout: () => void
  isBusinessUser?: boolean
}

/**
 * ⌘K palette. Entries are derived from the same nav source as the sidebar and
 * mobile menu, so links stay lang-scoped and can never drift out of sync.
 */
export function CommandMenu({
  isOpen,
  onClose,
  labels,
  onLogout,
  isBusinessUser = false,
}: CommandMenuProps) {
  const navigate = useNavigate()
  const { lang = "es" } = useParams()
  const [search, setSearch] = useState("")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  // Lock scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Reset the query each time it reopens.
  useEffect(() => {
    if (isOpen) setSearch("")
  }, [isOpen])

  if (!isOpen) return null

  const items = getStudentNavItems({
    lang,
    pathname: "",
    isBusinessUser,
    labels,
  })
  const navigationItems = items.filter((item) => !item.isLogout)
  const settingsItems = items.filter((item) => item.isLogout)

  const run = (item: StudentNavItem) => {
    if (item.isLogout) {
      onClose()
      onLogout()
      return
    }
    if (item.href) navigate(item.href)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
      <button
        type="button"
        aria-label={labels.commandMenu.closeAria}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-academy-ink/60 backdrop-blur-sm"
      />

      <Command
        className="relative w-full max-w-2xl overflow-hidden rounded-card border-2 border-border-strong bg-surface-card shadow-hard-lg"
        // Filtering is ours (label + keyword aware).
        shouldFilter={false}
      >
        <div className="flex items-center border-b-2 border-border-strong bg-academy-yellow px-4">
          <IconSearch aria-hidden className="size-5 shrink-0" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={labels.commandMenu.placeholder}
            className="flex h-14 w-full bg-transparent px-4 py-3 font-bold placeholder:text-content-primary/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.commandMenu.closeAria}
            className="rounded-button p-2 transition-colors hover:bg-academy-ink/10"
          >
            <IconX aria-hidden className="size-5" />
          </button>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-12 text-center text-sm font-bold text-content-muted">
            {labels.commandMenu.emptyText}
          </Command.Empty>

          <CommandGroup
            heading={labels.commandMenu.navigationGroup}
            items={navigationItems}
            search={search}
            onRun={run}
          />
          <CommandGroup
            heading={labels.commandMenu.settingsGroup}
            items={settingsItems}
            search={search}
            onRun={run}
            danger
          />
        </Command.List>
      </Command>
    </div>
  )
}

function CommandGroup({
  heading,
  items,
  search,
  onRun,
  danger,
}: {
  heading: string
  items: StudentNavItem[]
  search: string
  onRun: (item: StudentNavItem) => void
  danger?: boolean
}) {
  const query = search.trim().toLowerCase()
  const visible = query
    ? items.filter((item) => item.label.toLowerCase().includes(query))
    : items

  if (visible.length === 0) return null

  return (
    <Command.Group className="mb-2 overflow-hidden rounded-card border-2 border-border-strong bg-surface-card">
      <div className="border-b-2 border-border-strong bg-surface-muted px-3 py-2">
        <p className="text-label font-bold tracking-tight-brand uppercase">
          {heading}
        </p>
      </div>
      {visible.map((item, index) => (
        <Command.Item
          key={item.id}
          value={item.id}
          onSelect={() => onRun(item)}
          className={cn(
            "flex cursor-pointer items-center gap-3 px-3 py-3 font-bold transition-colors data-[selected=true]:bg-academy-yellow",
            index !== visible.length - 1 && "border-b-2 border-border-strong",
            danger && item.isLogout && "text-academy-coral"
          )}
        >
          <item.icon aria-hidden className="size-5 shrink-0" />
          <span>{item.label}</span>
        </Command.Item>
      ))}
    </Command.Group>
  )
}

/** Owns the palette's open state and the ⌘K / Ctrl-K shortcut. */
export function useCommandMenu() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((open) => !open),
  }
}
