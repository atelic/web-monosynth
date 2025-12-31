import { useState } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'

interface VUMeterProps {
  getMeterLevel: () => number
  isPlaying: boolean
  className?: string
  compact?: boolean
}

export function VUMeter({ getMeterLevel, isPlaying, className = '', compact = false }: VUMeterProps) {
  const [level, setLevel] = useState(-60)

  useAnimationFrame(() => {
    const newLevel = getMeterLevel()
    // Smooth falloff
    setLevel((prev) => {
      if (newLevel > prev) return newLevel
      return prev - 2 // Falloff rate
    })
  }, isPlaying)

  // Convert dB to percentage (0-100)
  // -60dB = 0%, 0dB = 100%
  const percentage = Math.max(0, Math.min(100, ((level + 60) / 60) * 100))

  // Determine color based on level
  const getColor = () => {
    if (percentage > 90) return 'bg-ableton-red'
    if (percentage > 75) return 'bg-ableton-yellow'
    return 'bg-ableton-green'
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-[10px] font-semibold text-ableton-text-secondary uppercase tracking-wider">Level</span>
        <div className="relative flex-1 h-3 bg-ableton-bg rounded overflow-hidden min-w-[60px]">
          {/* Meter level */}
          <div
            className={`absolute top-0 bottom-0 left-0 transition-all duration-75 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
          {/* Grid lines */}
          <div className="absolute inset-0 flex justify-between px-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-px bg-ableton-border/50" />
            ))}
          </div>
        </div>
        <span className="text-[10px] font-mono text-ableton-text-muted tabular-nums w-12">
          {level > -60 ? `${level.toFixed(0)}dB` : '-∞'}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`bg-ableton-surface border border-ableton-border rounded-lg p-4 flex flex-col items-center ${className}`}
    >
      <h3 className="module-title mb-2">Level</h3>
      <div className="relative w-6 h-32 bg-ableton-bg rounded overflow-hidden">
        {/* Meter background gradient */}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 bg-gradient-to-b from-ableton-red/20 to-transparent" />
          <div className="flex-1 bg-gradient-to-b from-ableton-yellow/20 to-transparent" />
          <div className="flex-[2] bg-gradient-to-b from-ableton-green/20 to-transparent" />
        </div>

        {/* Meter level */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-75 ${getColor()}`}
          style={{ height: `${percentage}%` }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-1">
          {[0, -6, -12, -24, -48].map((db) => (
            <div key={db} className="h-px bg-ableton-border" />
          ))}
        </div>
      </div>

      {/* dB labels */}
      <div className="flex flex-col justify-between h-32 text-[9px] font-mono text-ableton-text-muted -mt-32 ml-10">
        <span>0</span>
        <span>-6</span>
        <span>-12</span>
        <span>-24</span>
        <span>-48</span>
      </div>

      <span className="mt-2 text-xs font-mono text-ableton-text tabular-nums">
        {level > -60 ? `${level.toFixed(0)} dB` : '-∞ dB'}
      </span>
    </div>
  )
}
