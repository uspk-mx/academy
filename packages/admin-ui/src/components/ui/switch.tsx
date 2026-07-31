import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@academy/admin-ui/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-pill border-2 border-border-strong bg-surface-muted transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-academy-green",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-pill border-2 border-border-strong bg-surface-card transition-transform data-checked:translate-x-5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
