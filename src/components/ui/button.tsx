import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl font-bold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-3 focus-visible:ring-[#12B886]/40",
  {
    variants: {
      variant: {
        default:
          "bg-[#12B886] text-white hover:bg-[#0fa678] shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none",
        game:
          "bg-[#12B886] text-white hover:bg-[#0fa678] shadow-[0_5px_0_#087F5B] active:translate-y-1 active:shadow-none",
        "game-secondary":
          "bg-white text-[#26334D] border-2 border-[#E8EDF5] hover:border-[#12B886]/40 shadow-[0_4px_0_#E8EDF5] active:translate-y-1 active:shadow-none",
        "game-coral":
          "bg-[#FF8787] text-white hover:bg-[#fa5252] shadow-[0_5px_0_#e03131] active:translate-y-1 active:shadow-none",
        "game-blue":
          "bg-[#4DABF7] text-white hover:bg-[#228be6] shadow-[0_5px_0_#1971c2] active:translate-y-1 active:shadow-none",
        "game-yellow":
          "bg-[#FFD43B] text-[#78350F] hover:bg-[#fcc419] shadow-[0_5px_0_#f59f00] active:translate-y-1 active:shadow-none",
        outline:
          "border-2 border-[#E8EDF5] bg-white text-[#26334D] hover:bg-slate-50",
        secondary:
          "bg-[#E8F5E9] text-[#087F5B] hover:bg-[#d4edd9]",
        ghost:
          "hover:bg-slate-100 text-[#26334D]",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
        link: "text-[#12B886] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-5 py-2.5 text-sm rounded-2xl gap-2",
        xs: "min-h-7 px-2.5 py-1 text-xs rounded-xl gap-1",
        sm: "min-h-9 px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
        lg: "min-h-12 px-6 py-3 text-base rounded-2xl gap-2",
        xl: "min-h-14 px-8 py-3.5 text-lg rounded-2xl gap-2.5",
        icon: "size-10 rounded-2xl",
        "icon-sm": "size-8 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
