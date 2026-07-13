import { useState } from 'react'
import { ToolHeader, Card, TextArea, CopyButton, ErrorBanner } from '../components/ui'
import { useSEO } from '../hooks/useSEO'

function Base64Coder() {
  useSEO('Base64 编解码 - Toolbox 在线工具', '在线 Base64 编码与解码工具，支持 UTF-8 编码')
  const [plainText, setPlainText] = useState('')
  const [base64Text, setBase64Text] = useState('')
  const [error, setError] = useState('')
  const [swapped, setSwapped] = useState(false)

  // 左侧（明文）输入 → 实时编码到右侧
  const handlePlainChange = (val: string) => {
    setPlainText(val)
    setError('')
    try {
      const bytes = new TextEncoder().encode(val)
      let binary = ''
      bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
      setBase64Text(btoa(binary))
    } catch (e) {
      setBase64Text('')
      setError(`编码失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 右侧（Base64）输入 → 实时解码到左侧
  const handleBase64Change = (val: string) => {
    setBase64Text(val)
    setError('')
    try {
      const binary = atob(val.trim())
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      setPlainText(new TextDecoder().decode(bytes))
    } catch (e) {
      setPlainText('')
      setError(`解码失败: 输入的内容不是有效的 Base64 字符串。${e instanceof Error ? e.message : ''}`)
    }
  }

  const swap = () => {
    setSwapped(!swapped)
    setError('')
  }

  const clearAll = () => {
    setPlainText('')
    setBase64Text('')
    setSwapped(false)
    setError('')
  }

  const rawLabel = '原始文本'
  const encodedLabel = 'Base64 编码'
  const rawPlaceholder = `输入原始文本，${swapped ? '左侧' : '右侧'}自动编码...`
  const encodedPlaceholder = `输入 Base64 字符串，${swapped ? '右侧' : '左侧'}自动解码...`

  return (
    <div>
      <ToolHeader title="Base64 编解码" description="文本 Base64 编码与解码，支持 UTF-8" icon="🔤" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
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
            <CopyButton text={swapped ? base64Text : plainText} />
          </div>
          <TextArea
            value={swapped ? base64Text : plainText}
            onChange={swapped ? handleBase64Change : handlePlainChange}
            placeholder={swapped ? encodedPlaceholder : rawPlaceholder}
            rows={10}
          />
        </Card>

        {/* 右侧 */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{swapped ? rawLabel : encodedLabel}</label>
            <CopyButton text={swapped ? plainText : base64Text} />
          </div>
          <TextArea
            value={swapped ? plainText : base64Text}
            onChange={swapped ? handlePlainChange : handleBase64Change}
            placeholder={swapped ? rawPlaceholder : encodedPlaceholder}
            rows={10}
          />
        </Card>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      <Card className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-gray-300">说明</h3>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• 左侧输入文本 → 右侧自动编码为 Base64</li>
          <li>• 右侧输入 Base64 → 左侧自动解码为文本</li>
          <li>• 使用 TextEncoder/TextDecoder 完整支持 UTF-8 编码</li>
          <li>• 所有操作在浏览器本地完成，数据不上传</li>
        </ul>
      </Card>
    </div>
  )
}

export default Base64Coder
