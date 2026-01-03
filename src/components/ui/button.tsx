import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-base font-normal transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary focus-visible:outline-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[#264AF4] active:bg-[#0031D8]",
        destructive:
          "bg-destructive text-white hover:bg-[#CE0000] active:bg-[#A90000] focus-visible:outline-destructive",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#B3B3B3] active:bg-[#999999]",
        ghost:
          "bg-transparent text-foreground hover:bg-muted/50 active:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] py-3 px-6 rounded-[4px] has-[>svg]:px-5",
        sm: "min-h-[44px] rounded-[4px] gap-1.5 py-3 px-4 has-[>svg]:px-3.5",
        lg: "min-h-[44px] rounded-[4px] py-3 px-8 has-[>svg]:px-6",
        xl: "min-h-[44px] rounded-lg py-3 px-10 text-lg has-[>svg]:px-8",
        icon: "size-[44px] rounded-[4px]",
        "icon-sm": "size-[44px] rounded-[4px]",
        "icon-lg": "size-[44px] rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
