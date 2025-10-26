import { cn, ComponentProps } from "@/lib/utils"

export const Toolbar = ({ className, style }: ComponentProps) => {
  return (
    <div className={cn("", className)} style={style}>
      Toolbar
    </div>
  )
}
