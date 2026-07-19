import { useState, useMemo } from 'react'
import { CronExpressionParser } from 'cron-parser'
import { ToolHeader, Card, TextInput, ErrorBanner } from '../components/ui'
import { CronIcon } from '../components/icons'
import { useSEO } from '../hooks/useSEO'

const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0 点', value: '0 0 * * *' },
  { label: '每周一 9 点', value: '0 9 * * 1' },
  { label: '每月 1 号 0 点', value: '0 0 1 * *' },
  { label: '工作日 9 点', value: '0 9 * * 1-5' },
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每 2 小时', value: '0 */2 * * *' },
]

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} 星期${weekday}`
}

function generateDescription(parts: string[]): string {
  const [min, hour, day, month, weekday] = parts
  const desc: string[] = []

  if (min === '*') desc.push('每分钟')
  else if (min.startsWith('*/')) desc.push(`每 ${min.slice(2)} 分钟`)
  else if (min.includes(',')) desc.push(`在第 ${min} 分钟`)
  else if (min.includes('-')) desc.push(`在 ${min.replace('-', ' 到 ')} 分钟之间`)
  else desc.push(`在第 ${min} 分钟`)

  if (hour === '*') desc.push('每小时')
  else if (hour.startsWith('*/')) desc.push(`每 ${hour.slice(2)} 小时`)
  else if (hour.includes(',')) desc.push(`在 ${hour} 点`)
  else if (hour.includes('-')) desc.push(`在 ${hour.replace('-', ' 到 ')} 点之间`)
  else desc.push(`在 ${hour} 点`)

  if (day === '*') desc.push('每天')
  else if (day.startsWith('*/')) desc.push(`每 ${day.slice(2)} 天`)
  else if (day.includes(',')) desc.push(`在 ${day} 号`)
  else if (day.includes('-')) desc.push(`在 ${day.replace('-', ' 到 ')} 号之间`)
  else desc.push(`在 ${day} 号`)

  if (month === '*') desc.push('每月')
  else if (month.startsWith('*/')) desc.push(`每 ${month.slice(2)} 个月`)
  else if (month.includes(',')) desc.push(`在 ${month} 月`)
  else if (month.includes('-')) desc.push(`在 ${month.replace('-', ' 到 ')} 月之间`)
  else desc.push(`在 ${month} 月`)

  if (weekday === '*') desc.push('每周')
  else {
    const wdNames = ['日', '一', '二', '三', '四', '五', '六']
    const parseWd = (w: string) => {
      const n = parseInt(w, 10)
      return n >= 0 && n <= 6 ? `星期${wdNames[n]}` : `星期${w}`
    }
    if (weekday.includes(',')) {
      desc.push(`在 ${weekday.split(',').map(parseWd).join('、')}`)
    } else if (weekday.includes('-')) {
      const [s, e] = weekday.split('-')
      desc.push(`在 ${parseWd(s)} 到 ${parseWd(e)}`)
    } else if (weekday.startsWith('*/')) {
      desc.push(`每 ${weekday.slice(2)} 个星期`)
    } else {
      desc.push(`在 ${parseWd(weekday)}`)
    }
  }

  return desc.join('，')
}

function CronParser() {
  useSEO('Cron 表达式解析 - Toolbox 在线工具', '在线 Cron 表达式校验和计算工具，计算下 N 次执行时间')
  const [expr, setExpr] = useState('*/5 * * * *')

  // 实时计算
  const { error, nextRuns, description } = useMemo(() => {
    const trimmed = expr.trim()
    if (!trimmed) return { error: '', nextRuns: [] as Date[], description: '' }

    const parts = trimmed.split(/\s+/)
    if (parts.length !== 5) {
      return { error: 'Cron 表达式应为 5 个字段：分 时 日 月 周', nextRuns: [] as Date[], description: '' }
    }

    try {
      const interval = CronExpressionParser.parse(trimmed, {
        currentDate: new Date(),
        tz: 'Asia/Shanghai',
      })

      const runs: Date[] = []
      for (let i = 0; i < 5; i++) {
        runs.push(interval.next().toDate())
      }
      return { error: '', nextRuns: runs, description: generateDescription(parts) }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { error: `无效的 Cron 表达式: ${msg}`, nextRuns: [] as Date[], description: '' }
    }
  }, [expr])

  return (
    <div className="tool-cron">
      <ToolHeader title="Cron 表达式" description="校验 Cron 表达式并计算下 5 次执行时间" icon={CronIcon} />

      <div className="space-y-4">
        <Card>
          <TextInput
            label="Cron 表达式（标准 5 段式：分 时 日 月 周）"
            value={expr}
            onChange={setExpr}
            placeholder="* * * * *"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-all duration-200 hover:border-tool-500 hover:text-tool-400 hover:shadow-sm active:scale-95"
                onClick={() => setExpr(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Card>

        {error && <ErrorBanner message={error} />}

        {description && (
          <Card>
            <h3 className="mb-2 text-sm font-medium text-gray-300">表达式含义</h3>
            <p className="text-sm text-gray-100">{description}</p>
          </Card>
        )}

        {nextRuns.length > 0 && (
          <Card>
            <h3 className="mb-3 text-sm font-medium text-gray-300">下 5 次执行时间（北京时间）</h3>
            <div className="space-y-2">
              {nextRuns.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-4 py-2.5 transition-all duration-200 hover:border-gray-700 hover:shadow-sm"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-tool-500 to-tool-600 text-xs font-bold text-white shadow-md shadow-tool-600/30">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-100">{formatDate(d)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-2 text-sm font-medium text-gray-300">Cron 表达式说明</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-400">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-2 text-left text-gray-300">字段</th>
                  <th className="px-3 py-2 text-left text-gray-300">取值范围</th>
                  <th className="px-3 py-2 text-left text-gray-300">特殊字符</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="px-3 py-2">分钟</td>
                  <td className="px-3 py-2">0-59</td>
                  <td className="px-3 py-2">* / - ,</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="px-3 py-2">小时</td>
                  <td className="px-3 py-2">0-23</td>
                  <td className="px-3 py-2">* / - ,</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="px-3 py-2">日</td>
                  <td className="px-3 py-2">1-31</td>
                  <td className="px-3 py-2">* / - , ? L</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="px-3 py-2">月</td>
                  <td className="px-3 py-2">1-12</td>
                  <td className="px-3 py-2">* / - ,</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">星期</td>
                  <td className="px-3 py-2">0-7 (0和7都是周日)</td>
                  <td className="px-3 py-2">* / - , ? L</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 space-y-1 text-xs text-gray-400">
            <p><code className="text-tool-400">*</code> 任意值 &nbsp; <code className="text-tool-400">/</code> 步进值 &nbsp; <code className="text-tool-400">-</code> 范围 &nbsp; <code className="text-tool-400">,</code> 列表 &nbsp; <code className="text-tool-400">L</code> 最后 &nbsp; <code className="text-tool-400">?</code> 不指定</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CronParser
