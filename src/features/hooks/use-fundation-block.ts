import { getFabric, FabricNS, FabricType } from "@/lib/fabric-loader"
import { useCallback } from "react"

// 统一的外观样式
const FUNDATION_BLOCK_STYLES = {
  // 控制点（角）的填充颜色 - 白色
  cornerColor: "#fff",
  // 控制点的形状 - 圆形
  cornerStyle: "circle" as const,
  // 选中对象时的边框颜色 - 蓝色
  borderColor: "#3b82f6",
  // 边框宽度的缩放因子 - 1.5倍
  borderScaleFactor: 1.5,
  // 控制点是否透明 - 否
  transparentCorners: false,
  // 移动对象时边框的不透明度 - 1（完全不透明）
  borderOpacityWhenMoving: 1,
  // 控制点的描边颜色 - 蓝色
  cornerStrokeColor: "#3b82f6",
}

// 创建自定义形状类
const createFundationBlockClasses = (fabric: FabricType) => {
  // 自定义矩形类
  const FundationBlockRect = fabric.util.createClass(fabric.Rect, {
    type: "fundationBlockRect",

    initialize: function (options: FabricNS.IRectOptions) {
      this.callSuper("initialize", options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义圆形类
  const FundationBlockCircle = fabric.util.createClass(fabric.Circle, {
    type: "fundationBlockCircle",

    initialize: function (options: FabricNS.ICircleOptions) {
      this.callSuper("initialize", options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义三角形类
  const FundationBlockTriangle = fabric.util.createClass(fabric.Triangle, {
    type: "fundationBlockTriangle",

    initialize: function (options: FabricNS.IObjectOptions) {
      this.callSuper("initialize", options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义椭圆类
  const FundationBlockEllipse = fabric.util.createClass(fabric.Ellipse, {
    type: "fundationBlockEllipse",

    initialize: function (options: FabricNS.IEllipseOptions) {
      this.callSuper("initialize", options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义多边形类
  const FundationBlockPolygon = fabric.util.createClass(fabric.Polygon, {
    type: "fundationBlockPolygon",

    initialize: function (
      points: FabricNS.Point[],
      options: FabricNS.IObjectOptions
    ) {
      this.callSuper("initialize", points, options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义线条类
  const FundationBlockLine = fabric.util.createClass(fabric.Line, {
    type: "fundationBlockLine",

    initialize: function (
      points: [number, number, number, number],
      options: FabricNS.ILineOptions
    ) {
      this.callSuper("initialize", points, options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  // 自定义折线类
  const FundationBlockPolyline = fabric.util.createClass(fabric.Polyline, {
    type: "fundationBlockPolyline",

    initialize: function (
      points: FabricNS.Point[],
      options: FabricNS.IObjectOptions
    ) {
      this.callSuper("initialize", points, options)
      this.set(FUNDATION_BLOCK_STYLES)
    },

    toObject: function () {
      return this.callSuper("toObject")
    },
  })

  return {
    FundationBlockRect,
    FundationBlockCircle,
    FundationBlockTriangle,
    FundationBlockEllipse,
    FundationBlockPolygon,
    FundationBlockLine,
    FundationBlockPolyline,
  }
}

// 形状类型定义
type ShapeType =
  | "rect"
  | "circle"
  | "triangle"
  | "ellipse"
  | "polygon"
  | "line"
  | "polyline"

// Hook 实现
export const useFundationBlock = (
  canvas: FabricNS.Canvas | null,
  workspace: FabricNS.Rect | null = null
) => {
  const addFundationBlock = useCallback(
    (type: ShapeType, options: Record<string, unknown> = {}) => {
      if (!canvas) {
        throw new Error("Canvas is not initialized")
      }

      const fabric = getFabric()
      if (!fabric) {
        throw new Error("Fabric is not loaded")
      }

      // 创建自定义类
      const classes = createFundationBlockClasses(fabric)

      // 计算中心点：优先使用 workspace，否则使用 canvas
      let centerLeft: number
      let centerTop: number

      if (workspace) {
        // 使用 workspace 的中心点
        const workspaceCenter = workspace.getCenterPoint()
        centerLeft = workspaceCenter.x
        centerTop = workspaceCenter.y
      } else {
        // 降级使用 canvas 的中心点
        const canvasCenter = canvas.getCenter()
        centerLeft = canvasCenter.left
        centerTop = canvasCenter.top
      }

      // 提取 absolute 参数（默认为 false，即默认使用相对坐标）
      const { absolute = false, ...restOptions } = options
      const useAbsolute = absolute === true

      // 处理坐标转换：默认使用相对坐标，需要转换为绝对坐标
      let finalOptions = { ...restOptions }
      if (!useAbsolute && workspace) {
        // 相对坐标模式（默认）：相对于 workspace
        const workspaceLeft = workspace.left ?? 0
        const workspaceTop = workspace.top ?? 0

        // 如果用户提供了 left/top，转换为绝对坐标
        if (typeof restOptions.left === "number") {
          finalOptions.left = workspaceLeft + (restOptions.left as number)
        }
        if (typeof restOptions.top === "number") {
          finalOptions.top = workspaceTop + (restOptions.top as number)
        }
      }
      // 如果是绝对坐标模式，直接使用用户提供的值

      // 合并默认选项（中心定位）和用户提供的选项
      const defaultOptions = {
        left: centerLeft,
        top: centerTop,
        originX: "center" as const,
        originY: "center" as const,
      }

      finalOptions = { ...defaultOptions, ...finalOptions }

      // 根据类型创建对应的形状实例
      let block: FabricNS.Object

      switch (type) {
        case "rect":
          block = new classes.FundationBlockRect(finalOptions)
          break
        case "circle":
          block = new classes.FundationBlockCircle(finalOptions)
          break
        case "triangle":
          block = new classes.FundationBlockTriangle(finalOptions)
          break
        case "ellipse":
          block = new classes.FundationBlockEllipse(finalOptions)
          break
        case "polygon":
          // polygon 需要 points 参数
          const polygonPoints = options.points || [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 100 },
          ]
          block = new classes.FundationBlockPolygon(polygonPoints, finalOptions)
          break
        case "line":
          // line 需要 points 参数 [x1, y1, x2, y2]
          const linePoints = options.points || [0, 0, 100, 100]
          block = new classes.FundationBlockLine(linePoints, finalOptions)
          break
        case "polyline":
          // polyline 需要 points 参数
          const polylinePoints = options.points || [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 100, y: 0 },
          ]
          block = new classes.FundationBlockPolyline(
            polylinePoints,
            finalOptions
          )
          break
        default:
          throw new Error(`Unsupported shape type: ${type}`)
      }

      // 添加到画布
      canvas.add(block)
      canvas.renderAll()

      // 返回对象以支持链式调用
      return block
    },
    [canvas, workspace]
  )

  return { addFundationBlock }
}
