interface ToggleButtonProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  size?: 'sm' | 'md'
}

export function ToggleButton({ label, value, onChange, size = 'md' }: ToggleButtonProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className={`
          ${sizeClasses}
          rounded font-bold uppercase tracking-wide transition-all
          ${
            value
              ? 'bg-ableton-green text-white ring-2 ring-ableton-green/50 shadow-[0_0_8px_rgba(29,185,84,0.4)]'
              : 'bg-ableton-surface text-ableton-text-muted hover:bg-ableton-surface-light hover:text-ableton-text-dim'
          }
        `}
        onClick={() => onChange(!value)}
      >
        {value ? 'ON' : 'OFF'}
      </button>
      <span className="text-xs text-ableton-text-secondary">{label}</span>
    </div>
  )
}
