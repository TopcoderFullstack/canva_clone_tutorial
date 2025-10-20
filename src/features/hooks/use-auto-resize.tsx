import { FabricNS, getFabric } from "@/lib/fabric-loader"
import { useEffect, useCallback } from "react"

export const useAutoResize = ({
  containerDom,
  fabricCanvas,
}: {
  containerDom: HTMLDivElement | null
  fabricCanvas: FabricNS.Canvas | null
}) => {
  const autoZoom = useCallback(() => {
    if (!containerDom || !fabricCanvas) {
      return
    }

    // get container width & height
    const width = containerDom.offsetWidth
    const height = containerDom.offsetHeight

    // set fabric canva width & height
    fabricCanvas.setWidth(width)
    fabricCanvas.setHeight(height)

    // get workspace
    const workspace = fabricCanvas
      .getObjects()
      .find((object) => object.name === "workspace")

    if (!workspace) {
      return
    }

    // calculate zoom
    const fabric = getFabric()!
    const zoomRatio = 1

    {
      //@ts-expect-error -- fabric typings miss util.
      fabric.util.findScaleToFit(workspace, { width, height })
    }
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
  }, [fabricCanvas, containerDom])

  useEffect(() => {
    if (!containerDom || !fabricCanvas) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      autoZoom()
    })
    resizeObserver.observe(containerDom)
    return () => {
      resizeObserver?.disconnect()
    }
  }, [containerDom, fabricCanvas, autoZoom])
}
