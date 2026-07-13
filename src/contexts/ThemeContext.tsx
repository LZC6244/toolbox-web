import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Theme {
  id: string
  name: string
  /** Swatch color for the theme picker UI */
  swatch: string
  /** Whether this is a light-background theme */
  isLight: boolean
}

export const THEMES: Theme[] = [
  // 浅色主题
  { id: 'light-green', name: '浅色绿', swatch: '#10b981', isLight: true },
  { id: 'light', name: '日间模式', swatch: '#6366f1', isLight: true },
  { id: 'light-blue', name: '浅色蓝', swatch: '#3b82f6', isLight: true },
  // 深色主题
  { id: 'dark-indigo', name: '夜间模式', swatch: '#818cf8', isLight: false },
  { id: 'dark-purple', name: '午夜紫', swatch: '#c084fc', isLight: false },
  { id: 'dark-orange', name: '暖阳橙', swatch: '#fb923c', isLight: false },
]

const STORAGE_KEY = 'toolbox-theme'
const DEFAULT_THEME = 'light-green'

interface ThemeContextValue {
  themeId: string
  setThemeId: (id: string) => void
  currentTheme: Theme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0]

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
