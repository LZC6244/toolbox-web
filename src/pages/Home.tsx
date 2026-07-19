import { Link } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import { useSEO } from '../hooks/useSEO'
import { UrlIcon, MermaidIcon, ImageIcon, Base64Icon, ClockIcon, CronIcon, AsciiIcon, ArrowRightIcon } from '../components/icons'

interface ToolItem {
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  desc: string
  toolClass: string
}

const TOOLS: ToolItem[] = [
  { path: '/url', icon: UrlIcon, title: 'URL 编解码', desc: 'URL/URI 编码与解码，支持中文、特殊字符', toolClass: 'tool-url' },
  { path: '/mermaid', icon: MermaidIcon, title: 'Mermaid 可视化', desc: '实时渲染 Mermaid 流程图、时序图、甘特图', toolClass: 'tool-mermaid' },
  { path: '/base64-image', icon: ImageIcon, title: 'Base64 转图片', desc: 'Base64 字符串与图片互相转换，支持预览下载', toolClass: 'tool-image' },
  { path: '/base64', icon: Base64Icon, title: 'Base64 编解码', desc: '文本 Base64 编码与解码，支持 UTF-8', toolClass: 'tool-base64' },
  { path: '/timestamp', icon: ClockIcon, title: '时间戳转换', desc: 'Unix 时间戳与日期时间互转，支持秒/毫秒', toolClass: 'tool-time' },
  { path: '/cron', icon: CronIcon, title: 'Cron 表达式', desc: '校验 Cron 表达式并计算下 5 次执行时间', toolClass: 'tool-cron' },
  { path: '/ascii', icon: AsciiIcon, title: 'ASCII/Unicode 互转', desc: 'ASCII 码与 Unicode 编码互转，支持中文字符', toolClass: 'tool-ascii' },
]

function Home() {
  useSEO('Toolbox - 在线工具集合', '开箱即用的开发者在线工具集合，支持 URL 编解码、Mermaid 流程图、Base64 转换、时间戳转换、Cron 表达式解析等')
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="mb-10 mt-4">
        <h2 className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          在线工具集合
        </h2>
        <p className="mt-3 text-gray-400">开箱即用的开发者工具，纯浏览器端运行，数据不上传</p>
        <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" aria-hidden="true" />
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool, i) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`group ${tool.toolClass} animate-fade-in`}
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
          >
            <div className="glass relative h-full overflow-hidden rounded-2xl p-5 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-tool-500/40 hover:shadow-2xl hover:shadow-tool-600/20 cursor-pointer">
              {/* Top accent bar */}
              <div
                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-tool-400 via-tool-500 to-tool-600 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tool-500 to-tool-600 text-white shadow-lg shadow-tool-600/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-gray-100 transition-colors duration-300 group-hover:text-tool-400">
                {tool.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">{tool.desc}</p>
              <div className="mt-4 flex items-center text-xs font-medium text-tool-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span>立即使用</span>
                <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
