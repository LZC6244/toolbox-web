import { Link } from 'react-router-dom'
import { Card } from '../components/ui'
import { useSEO } from '../hooks/useSEO'

const TOOLS = [
  { path: '/url', icon: '🔗', title: 'URL 编解码', desc: 'URL/URI 编码与解码，支持中文、特殊字符' },
  { path: '/mermaid', icon: '📊', title: 'Mermaid 可视化', desc: '实时渲染 Mermaid 流程图、时序图、甘特图' },
  { path: '/base64-image', icon: '🖼️', title: 'Base64 转图片', desc: 'Base64 字符串与图片互相转换，支持预览下载' },
  { path: '/base64', icon: '🔤', title: 'Base64 编解码', desc: '文本 Base64 编码与解码，支持 UTF-8' },
  { path: '/timestamp', icon: '🕐', title: '时间戳转换', desc: 'Unix 时间戳与日期时间互转，支持秒/毫秒' },
  { path: '/cron', icon: '⏰', title: 'Cron 表达式', desc: '校验 Cron 表达式并计算下 5 次执行时间' },
  { path: '/ascii', icon: '🔣', title: 'ASCII/Unicode 互转', desc: 'ASCII 码与 Unicode 编码互转，支持中文字符' },
]

function Home() {
  useSEO('Toolbox - 在线工具集合', '开箱即用的开发者在线工具集合，支持 URL 编解码、Mermaid 流程图、Base64 转换、时间戳转换、Cron 表达式解析等')
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-100">在线工具集合</h2>
        <p className="mt-2 text-gray-400">开箱即用的开发者工具，纯浏览器端运行，数据不上传</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link key={tool.path} to={tool.path}>
            <Card className="transition-all hover:border-brand-600 hover:bg-gray-800/50 cursor-pointer">
              <div className="mb-3 text-3xl">{tool.icon}</div>
              <h3 className="mb-1 text-lg font-semibold text-gray-100">{tool.title}</h3>
              <p className="text-sm text-gray-400">{tool.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
