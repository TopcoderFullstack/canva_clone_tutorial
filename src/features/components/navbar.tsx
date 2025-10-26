"use client"
import { cn, ComponentProps } from "@/lib/utils"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"

export const Navbar = ({ className, style }: ComponentProps) => {
  return (
    <div
      className={cn(
        "flex justify-between place-content-center place-items-center",
        className
      )}
      style={style}
    >
      Navbar
      <ThemeToggle />
    </div>
  )
}
