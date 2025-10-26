"use client"
import { getFabric } from "@/lib/fabric-loader"
import { useRef, useEffect } from "react"
import { useEditor } from "@/features/hooks/use-editor"
import { cn, ComponentProps } from "@/lib/utils"

export const Editor = ({ className, style }: ComponentProps) => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const { init } = useEditor()

  useEffect(() => {
    const fabric = getFabric()!
    const canvas = new fabric.Canvas(canvasRef.current, {})
    init({ containerDom: containerRef.current!, fabricCanvas: canvas })
    return () => {
      canvas.dispose()
    }
  }, [init])

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full", className)}
      style={style}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
