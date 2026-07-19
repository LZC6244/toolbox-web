import { useState, useRef, useEffect, useCallback } from 'react'
import mermaid from 'mermaid'
import { ToolHeader, Card, ErrorBanner } from '../components/ui'
import { MermaidIcon, ZoomInIcon, ZoomOutIcon, ResetIcon, FullscreenIcon, ExitFullscreenIcon } from '../components/icons'
import { useSEO } from '../hooks/useSEO'

const DEFAULT_MERMAID = `graph TD
    A[开始] --> B{是否成功?}
    B -->|是| C[处理数据]
    B -->|否| D[记录错误]
    C --> E[返回结果]
    D --> F[重试]
    F --> B`

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#e0e7ff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#6366f1',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
  },
})

function MermaidViewer() {
  useSEO('Mermaid 图表查看器 - Toolbox 在线工具', '在线 Mermaid 流程图、时序图、甘特图实时渲染预览工具')
  const [code, setCode] = useState(DEFAULT_MERMAID)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  // 缩放 & 平移状态
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)

  // 拖拽状态
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 防抖渲染：避免每次按键都立即触发 mermaid.render
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const render = useCallback(async () => {
    if (!code.trim()) {
      setSvg('')
      setError('')
      return
    }
    // 不提前清空 error/svg，避免闪烁；渲染成功或失败后再更新
    try {
      const id = `mermaid-${Date.now()}`
      const result = await mermaid.render(id, code)
      setSvg(result.svg)
      setError('')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      // 保留上一次有效的 SVG，不清空，避免预览区闪烁
    }
  }, [code])

  useEffect(() => {
    // 防抖：停止输入 300ms 后再渲染
    if (renderTimer.current) clearTimeout(renderTimer.current)
    renderTimer.current = setTimeout(() => {
      render()
    }, 300)
    return () => {
      if (renderTimer.current) clearTimeout(renderTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // SVG 重新渲染时重置视角
  useEffect(() => {
    setScale(1)
    setTx(0)
    setTy(0)
  }, [svg])

  // --- 缩放控制 ---
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 5))
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.2))
  const resetView = () => {
    setScale(1)
    setTx(0)
    setTy(0)
  }

  // 滚轮缩放（以鼠标位置为中心，自动适配触发事件的容器）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLDivElement
    const rect = target.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - rect.width / 2
    const mouseY = e.clientY - rect.top - rect.height / 2

    const delta = -e.deltaY > 0 ? 1.1 : 1 / 1.1
    setScale((prevScale) => {
      const newScale = Math.max(0.2, Math.min(prevScale * delta, 5))
      const ratio = newScale / prevScale
      // 保持鼠标位置不动
      setTx((prevTx) => mouseX - (mouseX - prevTx) * ratio)
      setTy((prevTy) => mouseY - (mouseY - prevTy) * ratio)
      return newScale
    })
  }, [])

  // --- 平移（拖拽）控制 ---
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, tx, ty }
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setTx(dragStart.current.tx + dx)
    setTy(dragStart.current.ty + dy)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // 触摸支持
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        tx,
        ty,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStart.current.x
    const dy = e.touches[0].clientY - dragStart.current.y
    setTx(dragStart.current.tx + dx)
    setTy(dragStart.current.ty + dy)
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  const downloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mermaid.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ESC 关闭全屏
  useEffect(() => {
    if (!isFullscreen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isFullscreen])

  // 全屏时禁止页面滚动
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isFullscreen])

  // 画布交互事件集合，内联和全屏共用
  const canvasHandlers = {
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

  // 画布内容
  const canvasContent = svg ? (
    <div
      className="select-none"
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transformOrigin: 'center center',
        transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <div className="text-sm text-gray-400">输入 Mermaid 代码后自动渲染</div>
  )

  // 缩放按钮组
  const zoomControls = (
    <div className="flex items-center gap-1 rounded-lg bg-gray-800/80 px-1 py-0.5 shadow-sm border border-gray-700/50">
      <button
        className="flex h-7 w-7 items-center justify-center rounded text-gray-300 transition-all hover:bg-gray-700 hover:text-gray-100 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={zoomOut}
        title="缩小"
        disabled={scale <= 0.2}
      >
        <ZoomOutIcon className="h-4 w-4" />
      </button>
      <button
        className="flex h-7 w-7 items-center justify-center rounded text-gray-300 transition-all hover:bg-gray-700 hover:text-gray-100 active:scale-90"
        onClick={resetView}
        title="重置视角"
      >
        <ResetIcon className="h-3.5 w-3.5" />
      </button>
      <button
        className="flex h-7 w-7 items-center justify-center rounded text-gray-300 transition-all hover:bg-gray-700 hover:text-gray-100 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={zoomIn}
        title="放大"
        disabled={scale >= 5}
      >
        <ZoomInIcon className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <div className="tool-mermaid flex min-h-0 flex-1 flex-col">
      <ToolHeader title="Mermaid 可视化" description="实时渲染 Mermaid 图表" icon={MermaidIcon} />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Mermaid 代码</label>
            <button
              className="text-xs text-tool-400 hover:text-tool-500 transition-colors"
              onClick={() => setCode(DEFAULT_MERMAID)}
            >
              重置示例
            </button>
          </div>
          <textarea
            className="min-h-0 flex-1 w-full resize-y rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-100 placeholder-gray-500 transition-colors duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={20}
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-gray-400">
            支持 flowchart、sequenceDiagram、gantt、classDiagram、stateDiagram 等
          </p>
        </Card>

        <Card className="h-full">
          {/* 预览头部：标签 + 工具栏 */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-gray-300">
              预览
              <span className="ml-2 text-xs text-gray-400">
                {Math.round(scale * 100)}%
              </span>
            </label>
            <div className="flex items-center gap-2">
              {zoomControls}
              {/* 全屏按钮 */}
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-all hover:bg-gray-700 hover:text-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setIsFullscreen(true)}
                title="全屏预览"
                disabled={!svg}
                aria-label="全屏预览"
              >
                <FullscreenIcon className="h-4 w-4" />
              </button>
              {/* 下载 */}
              {svg && (
                <button
                  className="text-xs text-tool-400 hover:text-tool-500 transition-colors"
                  onClick={downloadSvg}
                >
                  下载 SVG
                </button>
              )}
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* 画布容器 */}
          <div
            ref={containerRef}
            className="mermaid-container relative flex min-h-0 flex-1 cursor-grab items-center justify-center overflow-hidden rounded-lg border border-gray-800 bg-gray-950/80 active:cursor-grabbing"
            {...canvasHandlers}
          >
            {canvasContent}
          </div>

          {/* 提示 */}
          <p className="mt-2 text-xs text-gray-400">
            滚轮缩放 · 拖拽平移 · 点击重置按钮恢复默认视角
          </p>
        </Card>
      </div>

      {/* 全屏预览覆盖层 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Mermaid 图表全屏预览"
        >
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">全屏预览</span>
              <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              {zoomControls}
              {svg && (
                <button
                  className="text-xs text-tool-400 hover:text-tool-500 transition-colors"
                  onClick={downloadSvg}
                >
                  下载 SVG
                </button>
              )}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-all hover:bg-gray-700 hover:text-gray-100 active:scale-95"
                onClick={() => setIsFullscreen(false)}
                title="退出全屏 (Esc)"
                aria-label="退出全屏"
              >
                <ExitFullscreenIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 全屏画布 */}
          <div
            ref={fullscreenRef}
            className="mermaid-container relative flex flex-1 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
            {...canvasHandlers}
          >
            {canvasContent}
          </div>

          {/* 底部提示 */}
          <div className="border-t border-gray-800 px-4 py-2 text-center text-xs text-gray-400">
            滚轮缩放 · 拖拽平移 · 按 Esc 退出全屏
          </div>
        </div>
      )}
    </div>
  )
}

export default MermaidViewer
