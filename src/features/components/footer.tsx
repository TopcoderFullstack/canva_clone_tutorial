import { cn, ComponentProps } from "@/lib/utils"

export const Footer = ({ className, style }: ComponentProps) => {
  return (
    <div className={cn("", className)} style={style}>
      Footer
    </div>
  )
}
