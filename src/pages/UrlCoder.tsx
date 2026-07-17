import { useState, useEffect } from 'react'
import { ToolHeader, Card, TextArea, CopyButton, ErrorBanner } from '../components/ui'
import { useSEO } from '../hooks/useSEO'

type Mode = 'component' | 'uri'

function UrlCoder() {
  useSEO('URL 编解码 - Toolbox 在线工具', '在线 URL/URI 编码与解码工具，支持中文和特殊字符编码')
  const [rawText, setRawText] = useState('')
  const [encodedText, setEncodedText] = useState('')
  const [mode, setMode] = useState<Mode>('uri')
  const [error, setError] = useState('')
  const [swapped, setSwapped] = useState(true)

  // 使用 ResizeObserver 同步两侧 textarea 高度
  useEffect(() => {
    const raw = document.getElementById('url-raw-textarea') as HTMLTextAreaElement | null
    const encoded = document.getElementById('url-encoded-textarea') as HTMLTextAreaElement | null
    if (!raw || !encoded) return

    let isSyncing = false
    let syncTimer: ReturnType<typeof setTimeout> | null = null

    const sync = (source: HTMLElement, target: HTMLElement) => {
      if (isSyncing) return
      isSyncing = true
      target.style.height = `${source.clientHeight}px`
      syncTimer = setTimeout(() => { isSyncing = false }, 50)
    }

    const ro1 = new ResizeObserver(() => sync(raw, encoded))
    const ro2 = new ResizeObserver(() => sync(encoded, raw))
    ro1.observe(raw)
    ro2.observe(encoded)

    return () => {
      ro1.disconnect()
      ro2.disconnect()
      if (syncTimer) clearTimeout(syncTimer)
    }
  }, [])

  // 左侧（原始文本）输入 → 实时编码到右侧
  // currentMode 参数用于模式切换时避免闭包中 mode 仍为旧值
  const handleRawChange = (val: string, currentMode: Mode = mode) => {
    setRawText(val)
    setError('')
    try {
      setEncodedText(currentMode === 'component' ? encodeURIComponent(val) : encodeURI(val))
    } catch (e) {
      setEncodedText('')
      setError(`编码失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 右侧（编码文本）输入 → 实时解码到左侧
  const handleEncodedChange = (val: string) => {
    setEncodedText(val)
    setError('')
    try {
      setRawText(mode === 'component' ? decodeURIComponent(val) : decodeURI(val))
    } catch (e) {
      setRawText('')
      setError(`解码失败: 输入的内容不是有效的 URL 编码。${e instanceof Error ? e.message : ''}`)
    }
  }

  const swap = () => {
    setSwapped(!swapped)
    setError('')
  }

  const clearAll = () => {
    setRawText('')
    setEncodedText('')
    setSwapped(true)
    setError('')
  }

  const rawLabel = '原始文本'
  const encodedLabel = '编码文本'
  const rawPlaceholder = `输入原始文本，${swapped ? '左侧' : '右侧'}自动编码...`
  const encodedPlaceholder = `输入编码文本，${swapped ? '右侧' : '左侧'}自动解码...`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ToolHeader title="URL 编解码" description="URL/URI 编码与解码" icon="🔗" />

      {/* 模式切换 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => {
              const newMode: Mode = 'uri'
              setMode(newMode)
              // 重新编码
              if (rawText) handleRawChange(rawText, newMode)
            }}
            className={`px-3 py-1.5 text-xs transition-colors ${
              mode === 'uri'
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="encodeURI / decodeURI"
          >
            URI 编码
          </button>
          <button
            onClick={() => {
              const newMode: Mode = 'component'
              setMode(newMode)
              // 重新编码
              if (rawText) handleRawChange(rawText, newMode)
            }}
            className={`px-3 py-1.5 text-xs transition-colors ${
              mode === 'component'
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="encodeURIComponent / decodeURIComponent"
          >
            整址编码
          </button>
        </div>
        <button
          onClick={swap}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
        >
          交换 ↔
        </button>
        <button
          onClick={clearAll}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
        >
          清空
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        {/* 左侧 */}
        <Card className="h-full">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{swapped ? encodedLabel : rawLabel}</label>
            <CopyButton text={swapped ? encodedText : rawText} />
          </div>
          <TextArea
            id="url-raw-textarea"
            value={swapped ? encodedText : rawText}
            onChange={swapped ? handleEncodedChange : handleRawChange}
            placeholder={swapped ? encodedPlaceholder : rawPlaceholder}
            rows={12}
          />
        </Card>

        {/* 右侧 */}
        <Card className="h-full">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{swapped ? rawLabel : encodedLabel}</label>
            <CopyButton text={swapped ? rawText : encodedText} />
          </div>
          <TextArea
            id="url-encoded-textarea"
            value={swapped ? rawText : encodedText}
            onChange={swapped ? handleRawChange : handleEncodedChange}
            placeholder={swapped ? rawPlaceholder : encodedPlaceholder}
            rows={12}
          />
        </Card>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
    </div>
  )
}

export default UrlCoder
