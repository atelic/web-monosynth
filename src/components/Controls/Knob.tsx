import { useCallback, useRef, useState, useEffect } from 'react'
import { AUDIO_CONSTANTS } from '../../constants/audio'

interface KnobProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  displayValue?: (value: number) => string
  defaultValue?: number
}

const sizeClasses = {
  sm: { knob: 'w-10 h-10', text: 'text-xs' },
  md: { knob: 'w-14 h-14', text: 'text-sm' },
  lg: { knob: 'w-20 h-20', text: 'text-base' },
}

export function Knob({
  value,
  min,
  max,
  onChange,
  label,
  unit = '',
  size = 'md',
  displayValue,
  defaultValue,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartValue = useRef(0)

  const normalizedValue = (value - min) / (max - min)
  const rotation = normalizedValue * 270 - 135 // -135 to 135 degrees

  const handleDoubleClick = useCallback(() => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }, [defaultValue, onChange])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      dragStartY.current = e.clientY
      dragStartValue.current = value
    },
    [value]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY
      const range = max - min
      const sensitivity = range / AUDIO_CONSTANTS.KNOB_DRAG_SENSITIVITY_PX
      const newValue = Math.max(min, Math.min(max, dragStartValue.current + deltaY * sensitivity))
      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, min, max, onChange])

  const formattedValue = displayValue ? displayValue(value) : value.toFixed(1)

  return (
    <div className="knob-container">
      <span className="knob-label">{label}</span>
      <div
        ref={knobRef}
        className={`${sizeClasses[size].knob} relative cursor-grab active:cursor-grabbing select-none`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={defaultValue !== undefined ? 'Double-click to reset' : undefined}
      >
        {/* Background track */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-ableton-border"
            strokeDasharray="188.5 62.8"
            strokeDashoffset="-31.4"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-ableton-accent"
            strokeDasharray={`${normalizedValue * 188.5} 251.3`}
            strokeDashoffset="-31.4"
            strokeLinecap="round"
          />
        </svg>
        {/* Knob body */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-b from-ableton-surface-light to-ableton-surface shadow-knob"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Indicator line */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-ableton-accent rounded-full" />
        </div>
      </div>
      <span className={`knob-value ${sizeClasses[size].text}`}>
        {formattedValue}
        {unit}
      </span>
    </div>
  )
}
