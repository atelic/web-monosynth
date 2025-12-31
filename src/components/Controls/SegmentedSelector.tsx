interface SegmentedSelectorProps<T extends string | number> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  size?: 'sm' | 'md'
}

export function SegmentedSelector<T extends string | number>({
  label,
  value,
  options,
  onChange,
  size = 'md',
}: SegmentedSelectorProps<T>) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex rounded bg-ableton-surface overflow-hidden">
        {options.map((option) => (
          <button
            key={String(option.value)}
            className={`
              ${sizeClasses}
              font-medium uppercase tracking-wide transition-all border-r border-ableton-bg last:border-r-0
              ${
                value === option.value
                  ? 'bg-ableton-orange text-ableton-bg'
                  : 'text-ableton-text-secondary hover:bg-ableton-surface-light'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-ableton-text-secondary">{label}</span>
    </div>
  )
}
