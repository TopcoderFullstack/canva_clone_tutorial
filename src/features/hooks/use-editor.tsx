import { getFabric, FabricNS } from "@/lib/fabric-loader"
import { useCallback, useState } from "react"
import { useAutoResize } from "./use-auto-resize"

export const useEditor = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [canvas, setCanvas] = useState<FabricNS.Canvas | null>(null)
  const [workspace, setWorkspace] = useState<FabricNS.Rect | null>(null)

  useAutoResize({ containerDom: container, fabricCanvas: canvas, workspace })

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
      // 移除 clipPath，改用透明度控制
      // fabricCanvas.clipPath = workspace

      // 添加边框以显示 workspace 边界
      workspace.set({
        stroke: "#e5e7eb", // 浅灰色边框
        strokeWidth: 2,
      })

      // 检查对象是否超出 workspace 或与其他对象重叠的函数
      const checkObjectState = (obj: FabricNS.Object, isDragging = false) => {
        if (!obj || obj === workspace) return

        // 使用 getBoundingRect(true) 获取绝对坐标
        const objBounds = obj.getBoundingRect(true, true)

        // 获取 workspace 的实际边界
        const wsLeft = workspace.left ?? 0
        const wsTop = workspace.top ?? 0
        const wsWidth = workspace.width ?? 0
        const wsHeight = workspace.height ?? 0

        // 计算 workspace 的绝对边界
        const wsRight = wsLeft + wsWidth
        const wsBottom = wsTop + wsHeight

        // 检查是否完全在 workspace 内
        const isFullyInside =
          objBounds.left >= wsLeft &&
          objBounds.top >= wsTop &&
          objBounds.left + objBounds.width <= wsRight &&
          objBounds.top + objBounds.height <= wsBottom

        // 检查是否与其他对象重叠（仅在拖拽时）
        let hasCollision = false
        if (isDragging) {
          const allObjects = fabricCanvas.getObjects()
          for (const other of allObjects) {
            if (other === obj || other === workspace) continue

            const otherBounds = other.getBoundingRect(true, true)

            // 检测边界框是否重叠
            const isOverlapping = !(
              objBounds.left + objBounds.width <= otherBounds.left ||
              otherBounds.left + otherBounds.width <= objBounds.left ||
              objBounds.top + objBounds.height <= otherBounds.top ||
              otherBounds.top + otherBounds.height <= objBounds.top
            )

            if (isOverlapping) {
              hasCollision = true
              break
            }
          }
        }

        // 根据状态设置透明度
        if (!isFullyInside || hasCollision) {
          obj.set({ opacity: 0.5 })
        } else {
          obj.set({ opacity: 1 })
        }
      }

      // 监听对象移动事件（拖拽中）
      fabricCanvas.on("object:moving", (e) => {
        if (e.target) checkObjectState(e.target, true)
      })

      // 监听对象缩放事件（缩放中）
      fabricCanvas.on("object:scaling", (e) => {
        if (e.target) checkObjectState(e.target, true)
      })

      // 监听对象旋转事件（旋转中）
      fabricCanvas.on("object:rotating", (e) => {
        if (e.target) checkObjectState(e.target, true)
      })

      // 监听对象修改完成事件（拖拽/缩放/旋转结束）
      fabricCanvas.on("object:modified", (e) => {
        if (e.target) checkObjectState(e.target, false)
      })

      // 监听对象添加事件
      fabricCanvas.on("object:added", (e) => {
        if (e.target) checkObjectState(e.target, false)
      })

      setCanvas(fabricCanvas)
      setContainer(containerDom)
      setWorkspace(workspace)

      // const testBlock = new fabric.Rect({
      //   height: 100,
      //   width: 100,
      //   fill: "blue",
      // })

      // fabricCanvas.add(testBlock)
      // fabricCanvas.centerObject(testBlock)
    },
    []
  )

  return { init, workspace }
}
