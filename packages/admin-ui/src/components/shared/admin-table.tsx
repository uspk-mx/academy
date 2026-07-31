import { IconDots } from "@tabler/icons-react"
import type { ReactNode } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@academy/user-ui/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@academy/admin-ui/components/ui/table"
import { cn } from "@academy/admin-ui/lib/utils"

export interface AdminTableColumn<TRow> {
  header: ReactNode
  cell: (row: TRow) => ReactNode
  /** Fixed column width, e.g. "10rem". */
  width?: string
  className?: string
}

export interface RowAction<TRow> {
  label: string
  icon?: ReactNode
  destructive?: boolean
  onSelect: (row: TRow) => void
}

/** The "..." menu that closes out each row. */
export function RowActions<TRow>({
  row,
  actions,
}: {
  row: TRow
  actions: RowAction<TRow>[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-button border-2 border-transparent transition-colors hover:border-border-strong hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
          />
        }
        aria-label="Acciones"
      >
        <IconDots className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-card border-2 border-border-strong bg-surface-card shadow-hard-sm"
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={() => action.onSelect(row)}
            className={cn(
              "rounded-[calc(var(--radius-card)-6px)] font-semibold data-highlighted:bg-academy-yellow-soft",
              action.destructive &&
                "text-academy-coral data-highlighted:bg-academy-coral-soft data-highlighted:text-content-primary"
            )}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Dumb table over rows the loader already filtered and sorted. There is no
 * client-side table engine on purpose: searching and sorting live in the URL so
 * the server does the work once and the result is shareable and refresh-safe.
 */
export function AdminTable<TRow>({
  rows,
  columns,
  rowKey,
  actions,
  emptyMessage = "Sin resultados.",
}: {
  rows: TRow[]
  columns: AdminTableColumn<TRow>[]
  rowKey: (row: TRow) => string
  actions?: RowAction<TRow>[]
  emptyMessage?: string
}) {
  const columnCount = columns.length + (actions?.length ? 1 : 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={index}
              style={column.width ? { width: column.width } : undefined}
              className={column.className}
            >
              {column.header}
            </TableHead>
          ))}
          {actions?.length ? (
            <TableHead className="w-14">
              <span className="sr-only">Acciones</span>
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 text-center text-content-muted"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column, index) => (
                <TableCell key={index} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {actions?.length ? (
                <TableCell className="text-right">
                  <RowActions row={row} actions={actions} />
                </TableCell>
              ) : null}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
