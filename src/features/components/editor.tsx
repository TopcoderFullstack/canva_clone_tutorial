"use client"
import { getFabric } from "@/lib/fabric-loader"
import { useRef, useEffect } from "react"
import { useEditor } from "@/features/hooks/use-editor"

export const Editor = () => {
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
    <div ref={containerRef} className="h-full flex">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
