import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { CSSProperties } from "react"

// The following was auto-added by Code Template Snippets extension
// Common component props with Tailwind CSS support
export interface ComponentProps {
  className?: string
  style?: CSSProperties
}
