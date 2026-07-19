import { NavLink, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, type ReactNode, type ComponentType, type SVGProps } from 'react'
import { UrlIcon, MermaidIcon, ImageIcon, Base64Icon, ClockIcon, CronIcon, AsciiIcon, MenuIcon, ToolboxIcon } from './components/icons'

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
  icon: ComponentType<SVGProps<SVGSVGElement>>
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { path: '/url', label: 'URL 编解码', icon: UrlIcon, description: 'URL 编码与解码' },
  { path: '/mermaid', label: 'Mermaid 可视化', icon: MermaidIcon, description: '流程图实时渲染' },
  { path: '/base64-image', label: 'Base64 转图片', icon: ImageIcon, description: 'Base64 与图片互转' },
  { path: '/base64', label: 'Base64 编解码', icon: Base64Icon, description: '文本 Base64 编解码' },
  { path: '/timestamp', label: '时间戳转换', icon: ClockIcon, description: 'Unix 时间戳转换' },
  { path: '/cron', label: 'Cron 表达式', icon: CronIcon, description: '校验并计算执行时间' },
  { path: '/ascii', label: 'ASCII/Unicode', icon: AsciiIcon, description: 'ASCII 与 Unicode 互转' },
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
  const [sidebarHover, setSidebarHover] = useState(false)
  const location = useLocation()

  const isHome = location.pathname === '/'
  // 工具页默认收起为图标栏，悬停时临时展开；首页始终展开
  const collapsed = !isHome && !sidebarHover

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
      {/* Ambient gradient background */}
      <div className="ambient-bg" aria-hidden="true" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 h-full transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-16' : 'lg:w-72'} w-72`}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <div className="glass flex h-full flex-col border-r border-gray-700/60 shadow-2xl shadow-gray-400/20">
          {/* Logo - 点击跳转首页 */}
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 border-b border-gray-700/60 transition-colors hover:bg-gray-800/50 ${
              collapsed ? 'justify-center px-2 py-5' : 'px-6 py-5'
            }`}
            title="Toolbox 首页"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <ToolboxIcon className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-gray-100">Toolbox</h1>
                <p className="text-xs text-gray-400">在线工具集合</p>
              </div>
            )}
          </Link>

          {/* Nav */}
          <nav className={`flex-1 space-y-1 py-4 ${collapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-3'}`}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ${
                    collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <span className={`shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                      <item.icon className="h-5 w-5" />
                    </span>
                    {!collapsed && (
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{item.label}</span>
                        <span className={`truncate text-xs transition-colors ${isActive ? 'text-white/70' : 'text-gray-500 group-hover:text-gray-400'}`}>
                          {item.description}
                        </span>
                      </div>
                    )}
                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-gray-700 bg-white px-2.5 py-1.5 text-xs text-gray-100 opacity-0 shadow-xl shadow-gray-400/30 transition-opacity duration-200 group-hover:opacity-100 lg:block">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className={`border-t border-gray-700/60 ${collapsed ? 'px-2 py-4' : 'px-6 py-4'}`}>
            {authEnabled && !collapsed && (
              <div className="flex justify-end">
                <a
                  href="/api/auth/logout"
                  className="text-xs text-gray-400 transition-colors hover:text-gray-200"
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
        <div className="glass sticky top-0 z-20 flex items-center gap-3 border-b border-gray-700/60 px-4 py-3 lg:hidden">
          <button
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100 active:scale-95"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="菜单"
          >
            <MenuIcon className="h-5 w-5" />
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
