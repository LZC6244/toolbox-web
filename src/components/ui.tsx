import { ReactNode, useState, type ComponentType, type SVGProps } from 'react'
import { CheckIcon, AlertIcon } from './icons'

interface ToolHeaderProps {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export function ToolHeader({ title, description, icon: Icon }: ToolHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3 animate-fade-in">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-tool-500 to-tool-600 text-white shadow-lg shadow-tool-600/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-xl font-bold text-transparent">
          {title}
        </h2>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass flex min-h-0 flex-col rounded-2xl p-4 shadow-xl shadow-black/10 transition-all duration-300 hover:shadow-2xl ${className}`}>
      {children}
    </div>
  )
}

interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
  id?: string
  className?: string
  onMouseUp?: (e: React.MouseEvent<HTMLTextAreaElement>) => void
}

export function TextArea({ value, onChange, placeholder, rows = 6, label, id, className = '', onMouseUp }: TextAreaProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        id={id}
        className={`flex-1 w-full resize-y rounded-xl border border-gray-700 bg-gray-900/70 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30 ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onMouseUp={onMouseUp}
      />
    </div>
  )
}

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: string
}

export function TextInput({ value, onChange, placeholder, label, type = 'text' }: TextInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        type={type}
        className="w-full rounded-xl border border-gray-700 bg-gray-900/70 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 focus:border-tool-500 focus:outline-none focus:ring-2 focus:ring-tool-500/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  title?: string
}

export function Button({ children, onClick, variant = 'primary', className = '', title }: ButtonProps) {
  const styles = {
    primary: 'bg-gradient-to-r from-tool-600 to-tool-500 text-white shadow-md shadow-tool-600/30 hover:shadow-lg hover:shadow-tool-600/40 hover:brightness-110',
    secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-100 shadow-sm hover:shadow',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm hover:shadow',
  }
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${styles[variant]} ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
        copied
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 scale-105'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 border border-gray-600'
      }`}
      onClick={handleCopy}
      disabled={!text}
    >
      {copied ? <><CheckIcon className="mr-1 inline h-3.5 w-3.5" />已复制</> : '复制'}
    </button>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-300/60 bg-gradient-to-r from-red-50 to-red-100/50 px-4 py-3 text-sm text-red-700 shadow-md shadow-red-200/30 animate-fade-in">
      <span className="mt-0.5 shrink-0 text-red-500" aria-hidden="true"><AlertIcon className="h-4 w-4" /></span>
      <span>{message}</span>
    </div>
  )
}
