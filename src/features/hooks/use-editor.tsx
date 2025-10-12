import { getFabric, FabricNS } from "@/lib/fabric-loader"
import { useCallback } from "react"

export const useEditor = () => {
  const init = useCallback(
    ({
      containerDom,
      fabricCanvas,
    }: {
      containerDom: HTMLDivElement
      fabricCanvas: FabricNS.Canvas
    }) => {
      const fabric = getFabric()!

      fabricCanvas.setWidth(containerDom.offsetWidth)
      fabricCanvas.setHeight(containerDom.offsetHeight)

      const workspace = new fabric.Rect({
        width: 900,
        height: containerDom.offsetHeight,
        name: "workspace",
        fill: "white",
        selectable: false,
        hasControls: false,
      })

      fabricCanvas.add(workspace)
      fabricCanvas.centerObject(workspace)
      fabricCanvas.clipPath = workspace

      const testBlock = new fabric.Rect({
        height: 100,
        width: 100,
        fill: "blue",
      })

      fabricCanvas.add(testBlock)
      fabricCanvas.centerObject(testBlock)
    },
    []
  )

  return { init }
}
