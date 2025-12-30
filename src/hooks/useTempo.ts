import { useState, useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { DEFAULT_TEMPO_PARAMS } from '../types/synth.types'

export function useTempo() {
  const [bpm, setBpmState] = useState(DEFAULT_TEMPO_PARAMS.bpm)
  const [isPlaying, setIsPlaying] = useState(false)
  const tapTimesRef = useRef<number[]>([])

  // Sync Tone.Transport BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
  }, [bpm])

  const setBpm = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(240, newBpm))
    setBpmState(clampedBpm)
    Tone.getTransport().bpm.value = clampedBpm
  }, [])

  const startTransport = useCallback(() => {
    Tone.getTransport().start()
    setIsPlaying(true)
  }, [])

  const stopTransport = useCallback(() => {
    Tone.getTransport().stop()
    setIsPlaying(false)
  }, [])

  const toggleTransport = useCallback(() => {
    if (isPlaying) {
      stopTransport()
    } else {
      startTransport()
    }
  }, [isPlaying, startTransport, stopTransport])

  // Tap tempo functionality
  const tapTempo = useCallback(() => {
    const now = performance.now()
    const taps = tapTimesRef.current

    // Remove taps older than 2 seconds
    const recentTaps = taps.filter((t) => now - t < 2000)
    recentTaps.push(now)
    tapTimesRef.current = recentTaps

    // Need at least 2 taps to calculate tempo
    if (recentTaps.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      setBpm(calculatedBpm)
    }
  }, [setBpm])

  // Convert note value to seconds based on current BPM
  const getNoteTime = useCallback(
    (noteValue: '1/4' | '1/8' | '1/16' | '1/32'): number => {
      const quarterNote = 60 / bpm
      switch (noteValue) {
        case '1/4':
          return quarterNote
        case '1/8':
          return quarterNote / 2
        case '1/16':
          return quarterNote / 4
        case '1/32':
          return quarterNote / 8
        default:
          return quarterNote / 2
      }
    },
    [bpm]
  )

  // Convert note value to Tone.js time notation
  const getToneTime = useCallback((noteValue: '1/4' | '1/8' | '1/16' | '1/32'): string => {
    switch (noteValue) {
      case '1/4':
        return '4n'
      case '1/8':
        return '8n'
      case '1/16':
        return '16n'
      case '1/32':
        return '32n'
      default:
        return '8n'
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Tone.getTransport().stop()
    }
  }, [])

  return {
    bpm,
    setBpm,
    isPlaying,
    startTransport,
    stopTransport,
    toggleTransport,
    tapTempo,
    getNoteTime,
    getToneTime,
    transport: Tone.getTransport(),
  }
}
