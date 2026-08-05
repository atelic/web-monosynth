import { useCallback, useRef, useState } from 'react'
import { AUDIO_CONSTANTS } from '../../constants/audio'

interface KnobProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  unit?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  displayValue?: (value: number) => string
  defaultValue?: number
}

const sizeClasses = {
  xs: { knob: 'w-9 h-9', text: 'text-[11px]' },
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
  const activePointerId = useRef<number | null>(null)

  const normalizedValue = (value - min) / (max - min)
  const rotation = normalizedValue * 270 - 135 // -135 to 135 degrees

  const handleDoubleClick = useCallback(() => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }, [defaultValue, onChange])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      activePointerId.current = e.pointerId
      setIsDragging(true)
      dragStartY.current = e.clientY
      dragStartValue.current = value
    },
    [value]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || e.pointerId !== activePointerId.current) return
      const deltaY = dragStartY.current - e.clientY
      const range = max - min
      const fineMultiplier = e.shiftKey ? 0.2 : 1
      const sensitivity = (range / AUDIO_CONSTANTS.KNOB_DRAG_SENSITIVITY_PX) * fineMultiplier
      const newValue = Math.max(min, Math.min(max, dragStartValue.current + deltaY * sensitivity))
      onChange(newValue)
    },
    [isDragging, max, min, onChange]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    activePointerId.current = null
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const range = max - min
      const step = range / (e.shiftKey ? 500 : 100)
      let nextValue: number | null = null

      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') nextValue = value + step
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') nextValue = value - step
      if (e.key === 'Home') nextValue = min
      if (e.key === 'End') nextValue = max

      if (nextValue !== null) {
        e.preventDefault()
        onChange(Math.max(min, Math.min(max, nextValue)))
      }
    },
    [max, min, onChange, value]
  )

  const cancelPointer = useCallback(() => {
    activePointerId.current = null
    setIsDragging(false)
  }, [])

  const formattedValue = displayValue ? displayValue(value) : value.toFixed(1)

  return (
    <div className="knob-container">
      <span className="knob-label">{label}</span>
      <div
        ref={knobRef}
        className={`${sizeClasses[size].knob} knob-control relative cursor-grab select-none touch-none active:cursor-grabbing ${isDragging ? 'is-dragging' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(3))}
        aria-valuetext={`${formattedValue}${unit}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelPointer}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        title={
          defaultValue !== undefined
            ? 'Drag vertically. Hold Shift for fine control. Double-click to reset.'
            : 'Drag vertically. Hold Shift for fine control.'
        }
      >
        <div className="knob-ticks" aria-hidden="true">
          {Array.from({ length: 11 }, (_, index) => (
            <i key={index} style={{ transform: `rotate(${index * 27 - 135}deg)` }} />
          ))}
        </div>
        {/* Background track */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-ableton-border-light/35"
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
          className="knob-cap absolute inset-2 rounded-full border border-ableton-border-light bg-gradient-to-b from-ableton-surface-light to-ableton-bg shadow-knob"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Indicator line */}
          <div className="absolute left-1/2 top-1 h-2.5 w-[2px] -translate-x-1/2 bg-ableton-accent" />
          <div className="absolute inset-3 rounded-full border border-ableton-border/60 bg-ableton-bg/40" />
        </div>
      </div>
      <span className={`knob-value ${sizeClasses[size].text}`}>
        {formattedValue}
        {unit}
      </span>
    </div>
  )
}
