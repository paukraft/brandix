import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Named properties rather than `all`: `all` transitions layout properties
  // too, so a button that reflows animates its own width on the way. Relative
  // for the touch target, which reaches past the sizes drawn at 24–36px. The
  // press scale is the whole of the tactility: nothing below 0.95, past that
  // it reads as a bounce rather than a press.
  "group/button touch-target relative inline-flex shrink-0 items-center justify-center gap-3 rounded-full border border-transparent bg-clip-padding text-body font-normal whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity,scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:bg-foreground/[0.04]",
        soft: "bg-foreground/[0.06] hover:bg-foreground/[0.1]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-7 gap-2 px-3 text-note",
        icon: "size-9 gap-0",
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
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
