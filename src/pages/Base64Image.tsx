import { useState, useRef, useMemo, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { ToolHeader, Card, Button, ErrorBanner, CopyButton } from '../components/ui'
import { useSEO } from '../hooks/useSEO'

function Base64Image() {
  useSEO('Base64 转图片 - Toolbox 在线工具', '在线 Base64 字符串与图片互相转换工具，支持预览和下载')
  const [base64, setBase64] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const cleanBase64 = (str: string): string => {
    // Remove data URL prefix if present
    return str.replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim()
  }

  const handleFile = (file: File) => {
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setBase64(result)
    }
    reader.onerror = () => setError('读取文件失败')
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // 实时预览：Base64 输入变化时自动生成图片 URL
  const { imageUrl, previewError } = useMemo(() => {
    const trimmed = base64.trim()
    if (!trimmed) return { imageUrl: '', previewError: '' }

    const cleaned = cleanBase64(trimmed)
    if (!cleaned) return { imageUrl: '', previewError: '' }

    // 检测图片类型
    let mime = 'image/png'
    if (base64.includes('data:image/')) {
      const match = base64.match(/data:image\/([a-zA-Z]+);base64,/)
      if (match) mime = `image/${match[1]}`
    } else {
      const firstChars = cleaned.substring(0, 4)
      if (firstChars.startsWith('/9j/')) mime = 'image/jpeg'
      else if (firstChars.startsWith('iVBOR')) mime = 'image/png'
      else if (firstChars.startsWith('R0lG')) mime = 'image/gif'
      else if (firstChars.startsWith('UklGR')) mime = 'image/webp'
      else if (firstChars.startsWith('Qk')) mime = 'image/bmp'
    }
    const dataUrl = `data:${mime};base64,${cleaned}`
    return { imageUrl: dataUrl, previewError: '' }
  }, [base64])

  useEffect(() => {
    setError(previewError)
  }, [previewError])

  // ESC 退出全屏
  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `image-${Date.now()}.png`
    a.click()
  }

  const handleClear = () => {
    setBase64('')
    setError('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ToolHeader title="Base64 转图片" description="Base64 与图片互转、预览、下载" icon="🖼️" />

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Upload area */}
        <Card>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver ? 'border-brand-500 bg-brand-950/20' : 'border-gray-700'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="mb-3 text-4xl">📁</div>
            <p className="mb-2 text-sm text-gray-300">拖拽图片到此处，或</p>
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
              选择图片文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
            <p className="mt-2 text-xs text-gray-400">支持 PNG / JPEG / GIF / WebP / BMP / SVG</p>
          </div>
        </Card>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          {/* Base64 input */}
          <Card className="h-full">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Base64 字符串</label>
              <div className="flex gap-2">
                <CopyButton text={base64} />
                <button
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={handleClear}
                >
                  清空
                </button>
              </div>
            </div>
            <textarea
              className="min-h-0 flex-1 w-full resize-y rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-xs text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={base64}
              onChange={(e) => setBase64(e.target.value)}
              placeholder="粘贴 Base64 字符串（带或不带 data:image 前缀）..."
              rows={10}
              spellCheck={false}
            />
            <div className="mt-3 flex gap-2">
              {imageUrl && (
                <Button onClick={handleDownload} variant="secondary">下载图片</Button>
              )}
            </div>
          </Card>

          {/* Image preview */}
          <Card className="h-full">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">图片预览</label>
              {imageUrl && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
                >
                  全屏放大
                </button>
              )}
            </div>
            {error && <ErrorBanner message={error} />}
            {imageUrl ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <img
                  src={imageUrl}
                  alt="预览"
                  className="max-w-full cursor-zoom-in rounded-lg border border-gray-800 transition-transform hover:opacity-90"
                  onClick={() => setIsFullscreen(true)}
                />
                <p className="text-xs text-gray-400">
                  {(() => {
                    try {
                      const size = Math.round((base64.length * 3) / 4)
                      return `预估大小: ${(size / 1024).toFixed(2)} KB`
                    } catch {
                      return ''
                    }
                  })()}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[200px] items-center justify-center text-gray-600">
                <span className="text-sm">图片预览区</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 全屏覆盖层 */}
      {isFullscreen && imageUrl && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <span className="text-sm font-medium text-gray-300">图片全屏预览</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
            >
              退出全屏 (Esc)
            </button>
          </div>
          <div
            className="flex flex-1 items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt="全屏预览"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Base64Image
