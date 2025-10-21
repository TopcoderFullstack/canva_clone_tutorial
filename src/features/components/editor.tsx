"use client"
import { getFabric } from "@/lib/fabric-loader"
import { useRef, useEffect, useState } from "react"
import { useEditor } from "@/features/hooks/use-editor"
import { useFundationBlock } from "@/features/hooks/use-fundation-block"
import type { FabricNS } from "@/lib/fabric-loader"

export const Editor = () => {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState<FabricNS.Canvas | null>(null)

  const { init, workspace } = useEditor()
  const { addFundationBlock } = useFundationBlock(canvas, workspace)

  useEffect(() => {
    const fabric = getFabric()!
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {})

    init({ containerDom: containerRef.current!, fabricCanvas })
    setCanvas(fabricCanvas)

    return () => {
      fabricCanvas.dispose()
    }
  }, [init])

  // 测试 FundationBlock - 创建多个形状测试碰撞检测
  useEffect(() => {
    if (!canvas || !addFundationBlock || !workspace) {
      return
    }

    // 创建中心的蓝色方形
    addFundationBlock("rect", {
      width: 100,
      height: 100,
      fill: "blue",
    })

    // 创建左侧的红色圆形
    addFundationBlock("circle", {
      radius: 50,
      fill: "red",
      left: -150,
    })

    // 创建右侧的绿色三角形
    addFundationBlock("triangle", {
      width: 80,
      height: 80,
      fill: "green",
      left: 150,
    })
  }, [canvas, addFundationBlock, workspace])

  return (
    <div ref={containerRef} className="h-full flex">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
