import { useCallback, useRef, useState } from 'react'

interface PitchWheelProps {
  value: number
  onChange: (value: number) => void
  onRelease?: () => void
  label?: string
  height?: number
  springBack?: boolean
}

export function PitchWheel({
  value,
  onChange,
  onRelease,
  label = 'PITCH',
  height = 120,
  springBack = true,
}: PitchWheelProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Value is -1 to 1, center is 0
  const normalizedValue = (value + 1) / 2
  const handlePosition = normalizedValue * 100

  const handleDrag = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const relativeY = rect.bottom - clientY
      const percentage = Math.max(0, Math.min(1, relativeY / rect.height))
      // Convert to -1 to 1 range
      const newValue = percentage * 2 - 1
      onChange(newValue)
    },
    [onChange]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setIsDragging(true)
      handleDrag(e.clientY)
    },
    [handleDrag]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      handleDrag(e.clientY)
    },
    [handleDrag, isDragging]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      setIsDragging(false)
      if (springBack) {
        onChange(0)
      }
      onRelease?.()
    },
    [onChange, onRelease, springBack]
  )

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={trackRef}
        className="relative w-8 touch-none cursor-pointer overflow-hidden rounded bg-ableton-surface"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-valuenow={Number(value.toFixed(2))}
        style={{ height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-ableton-accent" />
        {/* Fill from center */}
        <div
          className="absolute left-1 right-1 bg-ableton-accent/30"
          style={{
            top: value > 0 ? `${50 - value * 50}%` : '50%',
            bottom: value < 0 ? `${50 + value * 50}%` : '50%',
          }}
        />
        {/* Track marks */}
        <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-ableton-bg opacity-50" />
          ))}
        </div>
        {/* Handle - clamp position to stay within bounds (6px handle half-height) */}
        <div
          className={`absolute left-0 right-0 h-3 rounded-sm shadow-md transition-colors ${
            isDragging ? 'bg-ableton-accent' : 'bg-ableton-text'
          }`}
          style={{ bottom: `clamp(0px, calc(${handlePosition}% - 6px), calc(100% - 12px))` }}
        />
      </div>
      <span className="text-xs text-ableton-text-secondary font-medium">{label}</span>
    </div>
  )
}
