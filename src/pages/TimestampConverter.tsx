import { useState, useEffect, useMemo } from 'react'
import { ToolHeader, Card, CopyButton } from '../components/ui'
import { ClockIcon } from '../components/icons'
import { useSEO } from '../hooks/useSEO'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function TimestampConverter() {
  useSEO('时间戳转换 - Toolbox 在线工具', '在线 Unix 时间戳与日期时间互相转换工具，支持秒/毫秒')
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [timestamp, setTimestamp] = useState('')
  const [unit, setUnit] = useState<'s' | 'ms'>('s')
  const [dateInput, setDateInput] = useState('')

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 时间戳 → 日期（实时计算）
  const dateResult = useMemo(() => {
    const ts = parseInt(timestamp.trim(), 10)
    if (isNaN(ts)) return ''
    const ms = unit === 's' ? ts * 1000 : ts
    const d = new Date(ms)
    if (isNaN(d.getTime())) return ''
    return formatDate(d)
  }, [timestamp, unit])

  // 日期 → 时间戳（实时计算）
  const tsResult = useMemo(() => {
    if (!dateInput) return ''
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return ''
    return String(Math.floor(d.getTime() / 1000))
  }, [dateInput])

  const useNow = () => {
    setTimestamp(String(now))
    setUnit('s')
  }

  return (
    <div className="tool-time">
      <ToolHeader title="时间戳转换" description="Unix 时间戳与日期时间互转" icon={ClockIcon} />

      <div className="space-y-4">
        {/* Live clock */}
        <Card className="text-center">
          <p className="text-sm text-gray-400">当前时间戳</p>
          <p className="mt-1 font-mono text-3xl font-bold text-tool-400 animate-pulse-subtle">{now}</p>
          <p className="mt-1 text-sm text-gray-400">{formatDate(new Date())}</p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Timestamp → Date */}
          <Card>
            <h3 className="mb-3 text-sm font-medium text-gray-300">时间戳 → 日期</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 transition-colors duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="输入时间戳..."
                />
                <select
                  className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-100 transition-colors duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 's' | 'ms')}
                  aria-label="时间戳单位"
                >
                  <option value="s">秒</option>
                  <option value="ms">毫秒</option>
                </select>
              </div>
              <button
                onClick={useNow}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-all duration-200 hover:text-gray-200 hover:border-gray-600 active:scale-95"
              >
                使用当前时间戳
              </button>
              {dateResult && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100">
                    {dateResult}
                  </div>
                  <CopyButton text={dateResult} />
                </div>
              )}
            </div>
          </Card>

          {/* Date → Timestamp */}
          <Card>
            <h3 className="mb-3 text-sm font-medium text-gray-300">日期 → 时间戳</h3>
            <div className="space-y-3">
              <input
                type="datetime-local"
                step="1"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 transition-colors duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                aria-label="选择日期时间"
              />
              {tsResult && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 font-mono text-sm text-gray-100">
                    {tsResult}
                  </div>
                  <CopyButton text={tsResult} />
                </div>
              )}
              {tsResult && (
                <p className="text-xs text-gray-400">
                  毫秒: {tsResult}000
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="mb-2 text-sm font-medium text-gray-300">说明</h3>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Unix 时间戳：从 1970-01-01 00:00:00 UTC 到指定时间的秒数</li>
            <li>• 秒级时间戳为 10 位数字，毫秒级为 13 位数字</li>
            <li>• 日期转时间戳的结果为秒级</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default TimestampConverter
