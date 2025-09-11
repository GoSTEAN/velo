import * as React from "react"
import { cn } from "@/components/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full border-border p-[16px] rounded-[7px] bg-card border flex items-center justify-center",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }