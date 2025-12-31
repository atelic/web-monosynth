import { useEffect, useRef, useCallback, useState } from 'react'

interface SpectrumAnalyzerProps {
  getFFTData: () => Float32Array
  isActive: boolean
  compact?: boolean
  className?: string
}

export function SpectrumAnalyzer({
  getFFTData,
  isActive,
  compact = false,
  className = '',
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 200, height: compact ? 48 : 80 })

  // Handle resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        const height = compact ? 48 : 80
        setDimensions({ width, height })
        if (canvasRef.current) {
          canvasRef.current.width = width
          canvasRef.current.height = height
        }
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [compact])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions
    const data = getFFTData()
    const bufferLength = data.length

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Calculate bar width based on canvas size
    const barCount = compact ? 32 : Math.min(64, bufferLength)
    const barWidth = (width / barCount) * 0.8
    const barGap = (width / barCount) * 0.2

    for (let i = 0; i < barCount; i++) {
      // Use logarithmic scaling for frequency bins
      const logIndex = Math.floor(Math.pow(i / barCount, 1.5) * bufferLength)
      const value = data[logIndex]

      // Convert dB to height (data is in dB, typically -100 to 0)
      const normalizedValue = Math.max(0, (value + 100) / 100)
      const barHeight = normalizedValue * height * 0.9

      // Color gradient based on frequency and amplitude
      const hue = 30 + (i / barCount) * 30 // Orange to yellow
      const saturation = 80 + normalizedValue * 20
      const lightness = 40 + normalizedValue * 20

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      ctx.fillRect(
        i * (barWidth + barGap),
        height - barHeight,
        barWidth,
        barHeight
      )
    }

    // Draw grid lines (fewer for compact)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    const gridLines = compact ? 2 : 4
    for (let i = 1; i < gridLines; i++) {
      const y = (height / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    if (isActive) {
      animationRef.current = requestAnimationFrame(draw)
    }
  }, [getFFTData, isActive, dimensions, compact])

  useEffect(() => {
    if (isActive) {
      draw()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, draw])

  const paddingClass = compact ? 'p-2' : 'p-3'

  return (
    <div ref={containerRef} className={`bg-ableton-surface rounded-lg ${paddingClass} ${className}`}>
      {!compact && (
        <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-2">
          Spectrum
        </h3>
      )}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded bg-ableton-bg w-full"
      />
    </div>
  )
}
