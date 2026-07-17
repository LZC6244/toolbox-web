import { NavLink, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, type ReactNode } from 'react'
import { THEMES, useTheme } from './contexts/ThemeContext'

import UrlCoder from './pages/UrlCoder'
import MermaidViewer from './pages/MermaidViewer'
import Base64Image from './pages/Base64Image'
import Base64Coder from './pages/Base64Coder'
import TimestampConverter from './pages/TimestampConverter'
import CronParser from './pages/CronParser'
import AsciiCoder from './pages/AsciiCoder'
import Home from './pages/Home'

interface NavItem {
  path: string
  label: string
  icon: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { path: '/url', label: 'URL 编解码', icon: '🔗', description: 'URL 编码与解码' },
  { path: '/mermaid', label: 'Mermaid 可视化', icon: '📊', description: '流程图实时渲染' },
  { path: '/base64-image', label: 'Base64 转图片', icon: '🖼️', description: 'Base64 与图片互转' },
  { path: '/base64', label: 'Base64 编解码', icon: '🔤', description: '文本 Base64 编解码' },
  { path: '/timestamp', label: '时间戳转换', icon: '🕐', description: 'Unix 时间戳转换' },
  { path: '/cron', label: 'Cron 表达式', icon: '⏰', description: '校验并计算执行时间' },
  { path: '/ascii', label: 'ASCII/Unicode', icon: '🔣', description: 'ASCII 与 Unicode 互转' },
]

/**
 * KeepAlive: render children always, but hide when not on the matching route.
 * This preserves component state (inputs, scroll, etc.) across route switches.
 */
function KeepAlive({ path, children }: { path: string; children: ReactNode }) {
  const location = useLocation()
  const active = path === '/'
    ? location.pathname === '/'
    : location.pathname === path || location.pathname.startsWith(path + '/')
  return (
    <div className={active ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
      {children}
    </div>
  )
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { themeId, setThemeId } = useTheme()

  // 检测是否已登录（_tb_auth_on cookie 由边缘函数在登录成功时设置）
  const [authEnabled, setAuthEnabled] = useState(false)
  useEffect(() => {
    setAuthEnabled(document.cookie.includes('_tb_auth_on=1'))
  }, [])

  const currentTool = NAV_ITEMS.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 h-full w-72 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-gray-900 border-r border-gray-800">
          {/* Logo - 点击跳转首页 */}
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-6 py-5 border-b border-gray-800 transition-colors hover:bg-gray-800/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-xl font-bold text-white">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-100">Toolbox</h1>
              <p className="text-xs text-gray-400">在线工具集合</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <span className="text-base">{item.icon}</span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{item.description}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">主题</span>
              <div className="flex gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-transform hover:scale-125 ${
                      themeId === t.id ? 'scale-110 border-gray-100' : 'border-transparent'
                    }`}
                    style={{
                      backgroundColor: t.isLight ? '#f1f5f9' : '#1e293b',
                    }}
                    title={t.name}
                    aria-label={t.name}
                  >
                    <span
                      className="block h-3 w-3 rounded-full"
                      style={{ backgroundColor: t.swatch }}
                    />
                  </button>
                ))}
              </div>
            </div>
            {authEnabled && (
              <div className="flex justify-end">
                <a
                  href="/api/auth/logout"
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  登出
                </a>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Top bar (mobile) */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-800 bg-gray-900/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="菜单"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-100">{currentTool?.label || '工具集合'}</span>
        </div>

        {/* Content - all pages stay mounted, toggled via CSS to preserve state */}
        <div className="flex min-h-0 flex-1 flex-col w-full px-4 py-4 lg:px-6 lg:py-6">
          <KeepAlive path="/"><Home /></KeepAlive>
          <KeepAlive path="/url"><UrlCoder /></KeepAlive>
          <KeepAlive path="/mermaid"><MermaidViewer /></KeepAlive>
          <KeepAlive path="/base64-image"><Base64Image /></KeepAlive>
          <KeepAlive path="/base64"><Base64Coder /></KeepAlive>
          <KeepAlive path="/timestamp"><TimestampConverter /></KeepAlive>
          <KeepAlive path="/cron"><CronParser /></KeepAlive>
          <KeepAlive path="/ascii"><AsciiCoder /></KeepAlive>
        </div>
      </main>
    </div>
  )
}

export default App
