import { FabricNS } from "@/lib/fabric-loader"
import { useEffect, useCallback, useRef } from "react"

export const useAutoResize = ({
  containerDom,
  fabricCanvas,
  workspace,
}: {
  containerDom: HTMLDivElement | null
  fabricCanvas: FabricNS.Canvas | null
  workspace: FabricNS.Rect | null
}) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const autoZoom = useCallback(() => {
    if (!containerDom || !fabricCanvas || !workspace) {
      return
    }

    // get container width & height without border
    const width = containerDom.clientWidth
    const height = containerDom.clientHeight

    // set fabric canva width & height
    fabricCanvas.setDimensions({ width, height })

    // calculate zoom
    const zoomRatio = 0.9

    const scale = Math.min(width / workspace.width!, height / workspace.height!)
    const zoom = zoomRatio * scale

    // get worksapce center info
    const workspaceCenter = workspace.getCenterPoint()
    // get fabric canva center info
    const canvasCenterX = width / 2
    const canvasCenterY = height / 2

    // calcauate translation
    const translateX = (canvasCenterX - workspaceCenter.x * zoom) * 1
    const translateY = (canvasCenterY - workspaceCenter.y * zoom) * 1

    // calcauate transform matrix
    const finalTransform: number[] = [
      zoom, // a: scale X
      0, // b: skew Y
      0, // c: skew X
      zoom, // d: scale Y
      translateX, // e: translate X
      translateY, // f: translate Y
    ]

    fabricCanvas.setViewportTransform(finalTransform)
  }, [fabricCanvas, containerDom, workspace])

  const debouncedAutoZoom = useCallback(
    (delay: number = 50) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer with custom delay
      debounceTimerRef.current = setTimeout(() => {
        autoZoom()
      }, delay)
    },
    [autoZoom]
  )

  useEffect(() => {
    if (!containerDom || !fabricCanvas) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      debouncedAutoZoom(20)
    })
    resizeObserver.observe(containerDom)
    return () => {
      // Clean up debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      resizeObserver?.disconnect()
    }
  }, [containerDom, fabricCanvas, debouncedAutoZoom])
}
