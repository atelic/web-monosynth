import { ReactNode } from 'react'

interface ModulePanelProps {
  title: string
  children: ReactNode
  className?: string
}

export function ModulePanel({ title, children, className = '' }: ModulePanelProps) {
  return (
    <div className={`module-panel ${className}`}>
      <h3 className="module-title">{title}</h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  )
}
