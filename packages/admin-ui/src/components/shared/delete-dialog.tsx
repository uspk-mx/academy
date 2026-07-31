import { IconLoader2 } from "@tabler/icons-react"

import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@academy/admin-ui/components/ui/alert-dialog"

/**
 * Destructive confirmation used across every list page. Naming the resource in
 * the body is the whole safeguard here — there is no undo on the API side.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  resourceType,
  resourceName,
  onConfirm,
  isLoading = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceType: string
  resourceName?: string | null
  onConfirm: () => void
  isLoading?: boolean
}) {
  const noun = resourceType.toLowerCase()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {noun}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que quieres eliminar
            {resourceName ? ` "${resourceName}"` : ` este ${noun}`}? Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <BrandButton
            variant="ink"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-academy-coral text-content-inverse"
          >
            {isLoading && <IconLoader2 className="size-4 animate-spin" />}
            Eliminar
          </BrandButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
