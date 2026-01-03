import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[4px] border mb-4 px-4 py-4 text-base leading-[170%] grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border/20",
        destructive:
          "text-[#EC0000] bg-[#FDEEEE] dark:bg-[#620000] border-[#EC0000]/20 [&>svg]:text-[#EC0000] *:data-[slot=alert-description]:text-[#EC0000]/90",
        success:
          "text-[#197A4B] bg-[#E6F5EC] dark:bg-[#032213] border-[#259D63]/20 [&>svg]:text-[#259D63] *:data-[slot=alert-description]:text-[#197A4B]/90",
        warning:
          "text-[#927200] bg-[#FBF5E0] dark:bg-[#604B00] border-[#B78F00]/20 [&>svg]:text-[#B78F00] *:data-[slot=alert-description]:text-[#927200]/90",
        info:
          "text-[#0066BE] bg-[#F0F9FF] dark:bg-[#00234B] border-[#008BF2]/20 [&>svg]:text-[#008BF2] *:data-[slot=alert-description]:text-[#0066BE]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
