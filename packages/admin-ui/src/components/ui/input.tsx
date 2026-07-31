import { IconEye, IconEyeClosed } from "@tabler/icons-react"
import * as React from "react"
import { useState } from "react"

import { Input as BaseInput } from "@academy/user-ui/components/ui/input"
import { Textarea as BaseTextarea } from "@academy/user-ui/components/ui/textarea"
import { cn } from "@academy/admin-ui/lib/utils"

/** Brand treatment shared by every admin control: solid border + hard shadow. */
const control =
  "rounded-button border-2 border-border-strong bg-surface-card shadow-hard-xs focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue aria-invalid:border-academy-coral aria-invalid:ring-0"

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <BaseInput className={cn(control, "h-11 px-4", className)} {...props} />
  )
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <BaseTextarea className={cn(control, "px-4 py-2.5", className)} {...props} />
  )
}

/**
 * Password field with a reveal toggle. `type="button"` matters: inside a form a
 * bare <button> submits, so the toggle would post the form instead of showing
 * the password.
 */
export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-content-muted transition-colors hover:text-content-primary"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? (
          <IconEye className="size-4" />
        ) : (
          <IconEyeClosed className="size-4" />
        )}
      </button>
    </div>
  )
}
