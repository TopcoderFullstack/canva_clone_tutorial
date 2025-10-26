import { cn, ComponentProps } from "@/lib/utils"

export const Sidebar = ({ className, style }: ComponentProps) => {
  return (
    <div className={cn("", className)} style={style}>
      Sidebar
    </div>
  )
}
