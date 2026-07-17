import { ReactNode } from 'react'

interface ToolHeaderProps {
  title: string
  description: string
  icon: string
}

export function ToolHeader({ title, description, icon }: ToolHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-xl">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-100">{title}</h2>
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
    <div className={`flex min-h-0 flex-col rounded-xl border border-gray-800 bg-gray-900/50 p-4 ${className}`}>
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
        className={`flex-1 w-full resize-y rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
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
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${styles[variant]} ${className}`}
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
  }
  return (
    <button
      className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600"
      onClick={handleCopy}
      disabled={!text}
    >
      复制
    </button>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  )
}
