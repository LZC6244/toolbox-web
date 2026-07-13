import { useState, useEffect } from 'react'
import { ToolHeader, Card, TextArea, CopyButton, ErrorBanner } from '../components/ui'
import { useSEO } from '../hooks/useSEO'

type Mode = 'ascii' | 'unicode'

// ASCII 编码：文本 → 十进制码（空格分隔）
function asciiEncode(text: string): string {
  return Array.from(text).map(ch => ch.charCodeAt(0).toString(10)).join(' ')
}

// ASCII 解码：十进制码 → 文本
function asciiDecode(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  return parts.map(n => {
    const code = parseInt(n, 10)
    if (isNaN(code)) throw new Error(`无效的数字: ${n}`)
    return String.fromCharCode(code)
  }).join('')
}

// Unicode 编码：文本 → \uXXXX 转义序列
function unicodeEncode(text: string): string {
  let result = ''
  for (const ch of Array.from(text)) {
    const cp = ch.codePointAt(0)!
    if (cp > 0xFFFF) {
      // 代理对：输出两个 \uXXXX
      const high = 0xD800 + ((cp - 0x10000) >> 10)
      const low = 0xDC00 + ((cp - 0x10000) & 0x3FF)
      result += `\\u${high.toString(16).padStart(4, '0')}\\u${low.toString(16).padStart(4, '0')}`
    } else {
      result += `\\u${cp.toString(16).padStart(4, '0')}`
    }
  }
  return result
}

// Unicode 解码：\uXXXX 转义序列 → 文本
function unicodeDecode(text: string): string {
  let result = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '\\' && text[i + 1] === 'u') {
      const hex = text.substring(i + 2, i + 6)
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        const code = parseInt(hex, 16)
        // 检查是否是高代理项，尝试配对低代理项
        if (code >= 0xD800 && code <= 0xDBFF && text[i + 6] === '\\' && text[i + 7] === 'u') {
          const lowHex = text.substring(i + 8, i + 12)
          if (/^[0-9a-fA-F]{4}$/.test(lowHex)) {
            const lowCode = parseInt(lowHex, 16)
            if (lowCode >= 0xDC00 && lowCode <= 0xDFFF) {
              const fullCode = 0x10000 + ((code - 0xD800) << 10) + (lowCode - 0xDC00)
              result += String.fromCodePoint(fullCode)
              i += 12
              continue
            }
          }
        }
        result += String.fromCharCode(code)
        i += 6
        continue
      }
    }
    result += text[i]
    i++
  }
  return result
}

function AsciiCoder() {
  useSEO('Toolbox 在线工具', '在线 ASCII 码与 Unicode 编码互转工具，支持中文字符')
  const [rawText, setRawText] = useState('')
  const [encodedText, setEncodedText] = useState('')
  const [mode, setMode] = useState<Mode>('ascii')
  const [error, setError] = useState('')
  const [swapped, setSwapped] = useState(false)

  // 使用 ResizeObserver 同步两侧 textarea 高度
  useEffect(() => {
    const raw = document.getElementById('ascii-raw-textarea') as HTMLTextAreaElement | null
    const encoded = document.getElementById('ascii-encoded-textarea') as HTMLTextAreaElement | null
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
      setEncodedText(currentMode === 'unicode' ? unicodeEncode(val) : asciiEncode(val))
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
      setRawText(mode === 'unicode' ? unicodeDecode(val) : asciiDecode(val))
    } catch (e) {
      setRawText('')
      setError(`解码失败: 输入的内容不是有效的${mode === 'unicode' ? 'Unicode' : 'ASCII'}编码。${e instanceof Error ? e.message : ''}`)
    }
  }

  const swap = () => {
    setSwapped(!swapped)
    setError('')
  }

  const clearAll = () => {
    setRawText('')
    setEncodedText('')
    setSwapped(false)
    setError('')
  }

  const rawLabel = '原始文本'
  const encodedLabel = mode === 'unicode' ? 'Unicode 编码' : 'ASCII 编码'
  const rawPlaceholder = `输入原始文本，${swapped ? '左侧' : '右侧'}自动编码...`
  const encodedPlaceholder = mode === 'unicode'
    ? `输入 \\uXXXX 编码，${swapped ? '右侧' : '左侧'}自动解码...`
    : `输入十进制码（空格分隔），${swapped ? '右侧' : '左侧'}自动解码...`

  return (
    <div>
      <ToolHeader title="ASCII/Unicode 互转" description="ASCII 码与 Unicode 编码互转，支持中文" icon="🔣" />

      {/* 模式切换 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => {
              const newMode: Mode = 'ascii'
              setMode(newMode)
              // 重新编码
              if (rawText) handleRawChange(rawText, newMode)
            }}
            className={`px-3 py-1.5 text-xs transition-colors ${
              mode === 'ascii'
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="charCodeAt / String.fromCharCode"
          >
            ASCII 编码
          </button>
          <button
            onClick={() => {
              const newMode: Mode = 'unicode'
              setMode(newMode)
              // 重新编码
              if (rawText) handleRawChange(rawText, newMode)
            }}
            className={`px-3 py-1.5 text-xs transition-colors ${
              mode === 'unicode'
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="codePointAt / String.fromCodePoint"
          >
            Unicode 编码
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左侧 */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{swapped ? encodedLabel : rawLabel}</label>
            <CopyButton text={swapped ? encodedText : rawText} />
          </div>
          <TextArea
            id="ascii-raw-textarea"
            value={swapped ? encodedText : rawText}
            onChange={swapped ? handleEncodedChange : handleRawChange}
            placeholder={swapped ? encodedPlaceholder : rawPlaceholder}
            rows={10}
          />
        </Card>

        {/* 右侧 */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              {swapped ? rawLabel : encodedLabel}
            </label>
            <CopyButton text={swapped ? rawText : encodedText} />
          </div>
          <TextArea
            id="ascii-encoded-textarea"
            value={swapped ? rawText : encodedText}
            onChange={swapped ? handleRawChange : handleEncodedChange}
            placeholder={swapped ? rawPlaceholder : encodedPlaceholder}
            rows={10}
          />
        </Card>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
    </div>
  )
}

export default AsciiCoder
