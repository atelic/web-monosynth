import { useRef, useEffect, useState } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'

interface WaveformDisplayProps {
  getWaveformData: () => Float32Array
  isPlaying: boolean
  className?: string
  compact?: boolean
}

export function WaveformDisplay({
  getWaveformData,
  isPlaying,
  className = '',
  compact = false,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
      }
    })

    resizeObserver.observe(canvas)
    return () => resizeObserver.disconnect()
  }, [])

  useAnimationFrame(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = getWaveformData()
    const dpr = window.devicePixelRatio

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines (fewer for compact)
    ctx.strokeStyle = '#3d3d3d'
    ctx.lineWidth = 1
    ctx.beginPath()
    // Horizontal center line
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    // Vertical lines
    const verticalLines = compact ? 2 : 4
    for (let i = 0; i <= verticalLines; i++) {
      const x = (canvas.width / verticalLines) * i
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
    }
    ctx.stroke()

    // Draw waveform
    ctx.strokeStyle = '#ff764d'
    ctx.lineWidth = (compact ? 1.5 : 2) * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()

    const sliceWidth = canvas.width / data.length

    for (let i = 0; i < data.length; i++) {
      const x = i * sliceWidth
      const y = ((data[i] + 1) / 2) * canvas.height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }, isPlaying)

  // Draw flat line when not playing
  useEffect(() => {
    if (isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and draw flat line
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#3d3d3d'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    const verticalLines = compact ? 2 : 4
    for (let i = 0; i <= verticalLines; i++) {
      const x = (canvas.width / verticalLines) * i
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
    }
    ctx.stroke()

    // Flat center line
    ctx.strokeStyle = '#ff764d'
    ctx.lineWidth = (compact ? 1.5 : 2) * window.devicePixelRatio
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }, [isPlaying, dimensions, compact])

  const heightClass = compact ? 'h-12' : 'h-24'
  const paddingClass = compact ? 'p-2' : 'p-4'

  return (
    <div
      className={`bg-ableton-surface border border-ableton-border rounded-lg ${paddingClass} ${className}`}
    >
      {!compact && <h3 className="module-title mb-2">Waveform</h3>}
      <canvas
        ref={canvasRef}
        className={`w-full ${heightClass} rounded bg-ableton-bg`}
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  )
}
