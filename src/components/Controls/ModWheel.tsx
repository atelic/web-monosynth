import { useCallback, useRef, useState, useEffect } from 'react'

interface ModWheelProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  height?: number
}

export function ModWheel({
  value,
  onChange,
  label = 'MOD',
  min = 0,
  max = 1,
  height = 120,
}: ModWheelProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const normalizedValue = (value - min) / (max - min)
  const fillHeight = normalizedValue * 100

  const handleDrag = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const relativeY = rect.bottom - clientY
      const percentage = Math.max(0, Math.min(1, relativeY / rect.height))
      const newValue = min + percentage * (max - min)
      onChange(newValue)
    },
    [min, max, onChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      handleDrag(e.clientY)
    },
    [handleDrag]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY)
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
  }, [isDragging, handleDrag])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={trackRef}
        className="relative w-8 rounded bg-ableton-surface cursor-pointer overflow-hidden"
        style={{ height }}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-ableton-orange transition-all duration-75"
          style={{ height: `${fillHeight}%` }}
        />
        {/* Track marks */}
        <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-ableton-bg opacity-50" />
          ))}
        </div>
        {/* Handle */}
        <div
          className="absolute left-0 right-0 h-2 bg-ableton-text rounded-sm shadow-md"
          style={{ bottom: `calc(${fillHeight}% - 4px)` }}
        />
      </div>
      <span className="text-xs text-ableton-text-secondary font-medium">{label}</span>
    </div>
  )
}
