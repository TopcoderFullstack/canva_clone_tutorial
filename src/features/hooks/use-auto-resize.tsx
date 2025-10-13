import { FabricNS, getFabric } from "@/lib/fabric-loader"
import { useEffect, useCallback } from "react"

/**
 * 自动调整画布大小和缩放的 Hook
 * 用于在容器尺寸变化时自动调整画布视图，使工作区始终居中且适配显示
 */
export const useAutoResize = ({
  containerDom,
  fabricCanvas,
}: {
  containerDom: HTMLDivElement | null
  fabricCanvas: FabricNS.Canvas | null
}) => {
  /**
   * 自动缩放函数：使工作区自适应容器大小并居中显示
   * 类似于 Canva 的 "适应屏幕" 功能
   *
   * 核心逻辑分为两大步骤：
   * 【第一步】按合适比例缩放工作区，使其适应新画布尺寸，避免内容超出
   * 【第二步】平移整个视口，使工作区中心点对齐到画布中心点
   *
   * ==================== 为什么不用 Fabric.js 自带的方法？====================
   *
   * Fabric.js 确实提供了一些相关方法：
   * Fabric.js 提供了：刀、锅、调料（基础工具）
   * 但没有提供："一键做红烧肉"的功能
   * 所以需要手动：组合使用刀、锅、调料，按照正确的步骤完成
   *
   * 1. centerObject(obj) - 只能居中对象，不能控制缩放和留白
   *    - 问题：会直接修改对象的位置，而我们需要的是调整视口
   *
   * 2. zoomToPoint(point, zoom) - 可以缩放，但不能自动计算"适配"的缩放比例
   *    - 问题：需要手动计算 zoom 值，无法一步到位
   *
   * 3. calcViewportBoundaries() - 只能计算视口边界，不能设置
   *    - 问题：只读方法，无法直接实现我们的需求
   *
   * 4. setViewportTransform(transform) - 最底层的方法，可以完全控制视口
   *    - 优势：可以精确控制缩放、平移、旋转等所有变换
   *    - 需要手动计算变换矩阵
   *
   * 所以这段代码结合了多个 Fabric.js 方法，实现了"自适应缩放并居中"的完整功能：
   * - 使用 findScaleToFit() 计算最佳缩放比例
   * - 使用 zoomToPoint() 应用缩放
   * - 手动计算并使用 setViewportTransform() 实现精确居中和 0.8 倍留白
   *
   * 这种组合方式给了我们完全的控制权，可以实现类似 Canva 的专业效果
   */
  const autoZoom = useCallback(() => {
    // 防御性检查：确保 DOM 容器和画布实例都已就绪
    if (!containerDom || !fabricCanvas) {
      return
    }

    // ========== 准备工作 ==========
    // 更新画布尺寸以匹配容器尺寸
    // 当浏览器窗口改变大小时，画布需要重新调整大小以填充整个容器
    const width = containerDom.offsetWidth // 获取容器的实际宽度（像素）
    const height = containerDom.offsetHeight // 获取容器的实际高度（像素）
    fabricCanvas.setWidth(containerDom.offsetWidth) // 设置画布宽度
    fabricCanvas.setHeight(containerDom.offsetHeight) // 设置画布高度

    // 获取画布中心点，作为后续缩放的锚点
    const center = fabricCanvas.getCenter()

    // 查找名为 'workspace' 的对象（工作区/画板）
    // workspace 是用户实际绘图的有边界区域，类似于 Canva 的画板
    const workspace = fabricCanvas
      .getObjects()
      .find((object) => object.name === "workspace")

    // 如果找不到工作区，无法继续计算缩放，直接返回
    if (!workspace) {
      return
    }

    // ========== 【第一步】计算并应用缩放比例 ==========
    // 目标：让工作区按合适比例缩放，完全适配新的画布尺寸，不超出边界
    const fabric = getFabric()! // 获取 Fabric.js 库实例
    const zoomRatio = 0.8 // 缩放比例 0.8 = 留出 20% 的边距空间，使工作区不贴边
    //@ts-expect-error -- fabric typings miss util.
    // findScaleToFit: 计算让工作区完全适配容器所需的缩放比例
    // 例如：工作区 1000px 宽，容器 800px 宽，则 scale = 0.8
    const scale = fabric.util.findScaleToFit(workspace, { width, height })
    const zoom = zoomRatio * scale // 最终缩放 = 适配缩放 × 0.8（留白）

    // 重置视口变换并应用新的缩放
    // iMatrix 是单位矩阵 [1,0,0,1,0,0]，用于重置所有变换（缩放、平移、旋转）
    // 重置可以避免累积误差
    fabricCanvas.setViewportTransform(fabric.iMatrix.concat())
    // 从画布中心点进行缩放，避免缩放时内容位置跳动
    fabricCanvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom)

    // ========== 【第二步】平移视口，使工作区居中 ==========
    // 目标：计算平移偏移量，让工作区的中心点与画布的中心点重合
    const workspaceCenter = workspace.getCenterPoint() // 获取工作区的中心坐标
    const viewportTransform = fabricCanvas.viewportTransform // 获取当前视口变换矩阵

    // 安全检查：确保所有必需的值都存在
    if (
      fabricCanvas.width === undefined ||
      fabricCanvas.height === undefined ||
      !viewportTransform
    ) {
      return
    }

    // 修改变换矩阵以使工作区在视口中居中
    //
    // ==================== 什么是变换矩阵？通俗解释 ====================
    //
    // 问题：如何把一个点 (x, y) 变换到新位置 (x', y')？
    // 答案：通过一组数学公式，这些公式可以用 6 个数字表示
    //
    // 变换矩阵格式: [a, b, c, d, e, f]
    // 也就是: [scaleX, skewY, skewX, scaleY, translateX, translateY]
    //
    // ==================== 变换公式（核心）====================
    //
    // 原始坐标 (x, y) 经过变换后得到新坐标 (x', y')：
    //
    //   x' = a*x + c*y + e
    //   y' = b*x + d*y + f
    //
    // 其中：
    //   x' 表示"新的 X 坐标"（x prime，数学符号 x'）
    //   y' 表示"新的 Y 坐标"（y prime，数学符号 y'）
    //
    // 各参数的作用：
    //   a (scaleX)    - X 方向缩放倍数，如 2 表示放大 2 倍
    //   d (scaleY)    - Y 方向缩放倍数
    //   c (skewX)     - X 方向倾斜（斜切变换），通常为 0
    //   b (skewY)     - Y 方向倾斜，通常为 0
    //   e (translateX) - X 方向平移的像素数
    //   f (translateY) - Y 方向平移的像素数
    //
    // ==================== 实际例子 ====================
    //
    // 例1：只平移，不缩放不旋转
    // 矩阵 [1, 0, 0, 1, 100, 50] 表示向右移动 100px，向下移动 50px
    // 点 (10, 20) 变换后：
    //   x' = 1*10 + 0*20 + 100 = 110
    //   y' = 0*10 + 1*20 + 50  = 70
    // 结果：(10, 20) → (110, 70)
    //
    // 例2：缩放 2 倍并平移
    // 矩阵 [2, 0, 0, 2, 100, 50]
    // 点 (10, 20) 变换后：
    //   x' = 2*10 + 0*20 + 100 = 120
    //   y' = 0*10 + 2*20 + 50  = 90
    // 结果：(10, 20) → (120, 90)
    //
    // ==================== 为什么用 3×3 矩阵？====================
    //
    // 完整的 3×3 矩阵形式（数学表示）：
    //
    // ┌ a  c  e ┐   ┌ x ┐   ┌ a*x + c*y + e ┐   ┌ x' ┐
    // │ b  d  f │ × │ y │ = │ b*x + d*y + f │ = │ y' │
    // └ 0  0  1 ┘   └ 1 ┘   └ 0*x + 0*y + 1 ┘   └ 1  ┘
    //
    // 为什么最后一行是 [0, 0, 1]？
    //   - 这是数学技巧：让平移也能用矩阵乘法表示（齐次坐标系）
    //   - 最后一行永远是 [0, 0, 1]，不会变化，所以可以省略
    //   - 所以实际只需要前 6 个数字：[a, b, c, d, e, f]
    //
    // 为什么 x 和 y 后面要加个 1？
    //   - 数学技巧：把 2D 坐标 (x, y) 变成 3D 的 (x, y, 1)
    //   - 这样才能和 3×3 矩阵相乘，计算出平移效果
    //   - 第三个数永远是 1，这叫"齐次坐标"
    //
    // ==================== 单位矩阵（无变换）====================
    //
    // [1, 0, 0, 1, 0, 0] 表示：不做任何变换
    //   x' = 1*x + 0*y + 0 = x （X 坐标不变）
    //   y' = 0*x + 1*y + 0 = y （Y 坐标不变）
    //
    // ==================== 本代码的作用 ====================
    //
    // 我们要修改矩阵中的 e (translateX) 和 f (translateY)
    // 目的：计算出正确的平移量，让工作区居中
    //
    const transform = [...viewportTransform] // 克隆数组避免直接修改
    // transform[4] 是 translateX（e），计算公式：
    // 画布中心 X - 工作区中心 X × 当前缩放比例 = 需要的 X 偏移量
    transform[4] = fabricCanvas.width / 2 - workspaceCenter.x * transform[0]!
    // transform[5] 是 translateY（f），计算公式：
    // 画布中心 Y - 工作区中心 Y × 当前缩放比例 = 需要的 Y 偏移量
    transform[5] = fabricCanvas.height / 2 - workspaceCenter.y * transform[3]!

    // 应用新的变换矩阵，使工作区水平和垂直居中
    fabricCanvas.setViewportTransform(transform)

    // ========== 设置裁剪路径（额外功能）==========
    // 克隆工作区矩形作为裁剪路径，限制绘图区域在工作区内
    // 防止用户在工作区外绘图
    workspace.clone((cloned: fabric.Rect) => {
      fabricCanvas.clipPath = cloned // 设置裁剪路径（超出部分将不可见）
      fabricCanvas.requestRenderAll() // 请求重新渲染画布以显示更改
    })
  }, [fabricCanvas, containerDom]) // 依赖项：仅在画布或容器变化时重新创建函数

  /**
   * 监听容器尺寸变化的副作用
   * 当窗口大小改变或容器尺寸变化时，自动触发缩放调整
   */
  useEffect(() => {
    // 防御性检查：确保必需的实例都存在
    if (!containerDom || !fabricCanvas) {
      return
    }

    // 创建 ResizeObserver 监听器
    // ResizeObserver 是浏览器 API，用于监听元素尺寸变化
    // 比 window.resize 事件更精确，因为它监听特定元素而非整个窗口
    const resizeObserver = new ResizeObserver(() => {
      autoZoom() // 当容器尺寸变化时，执行自动缩放
    })

    // 开始监听容器 DOM 元素的尺寸变化
    resizeObserver.observe(containerDom)

    // 清理函数：组件卸载或依赖项变化时断开监听
    // 防止内存泄漏和不必要的回调执行
    return () => {
      resizeObserver?.disconnect()
    }
  }, [containerDom, fabricCanvas, autoZoom]) // 依赖项变化时重新设置监听器
}
