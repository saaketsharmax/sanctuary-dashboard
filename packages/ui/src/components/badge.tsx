import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors duration-150 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-muted/50 text-foreground/70 [a&]:hover:bg-muted/70",
        secondary:
          "bg-secondary/50 text-secondary-foreground [a&]:hover:bg-secondary/70",
        destructive:
          "bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15",
        outline:
          "border-border text-foreground/60 [a&]:hover:bg-muted/20",
        ghost: "[a&]:hover:bg-muted/30",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
