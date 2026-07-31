import { IconLoader2 } from "@tabler/icons-react"
import type { ReactNode } from "react"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@academy/user-ui/components/ui/drawer"

/**
 * Side panel wrapper for the create/edit forms. The form element lives in
 * `children` and is submitted from the footer through `formId`, so the sticky
 * footer works without duplicating buttons inside every form.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  submitting = false,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  formId: string
  submitLabel: string
  submitting?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent
        className={`border-l-2 border-border-strong bg-surface-card ${
          className ?? "sm:max-w-lg"
        }`}
        
      >
        <DrawerHeader className="border-b-2 border-border-subtle p-4">
          <DrawerTitle className="text-card-title leading-display font-bold tracking-tight-brand">
            {title}
          </DrawerTitle>
          {description && (
            <DrawerDescription className="text-sm text-content-muted">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

        <DrawerFooter className="border-t-2 border-border-subtle bg-surface-muted">
          <BrandButton
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </BrandButton>
          <BrandButton
            type="submit"
            variant="primary"
            size="sm"
            form={formId}
            disabled={submitting}
          >
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            {submitLabel}
          </BrandButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
