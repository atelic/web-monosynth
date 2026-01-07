import { useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { ArpPattern, ArpRate, ArpeggiatorParams, DEFAULT_ARPEGGIATOR_PARAMS } from '../types/synth.types'

interface UseArpeggiatorProps {
  playNote: (frequency: number) => void
  stopNote: (frequency: number) => void
  stopAllNotes: () => void
  playArpNote: (frequency: number, time?: number) => void
  stopArpNote: (frequency: number, time?: number) => void
  getNoteTime: (rate: ArpRate) => number
  getToneTime: (rate: ArpRate) => string
  setArpeggiating: (active: boolean) => void
  requestTransportStart?: (consumerId: string) => void
  releaseTransport?: (consumerId: string) => void
}

const ARPEGGIATOR_CONSUMER_ID = 'arpeggiator'

export function useArpeggiator({
  playNote,
  stopNote,
  stopAllNotes,
  playArpNote,
  stopArpNote,
  getNoteTime,
  getToneTime,
  setArpeggiating,
  requestTransportStart,
  releaseTransport,
}: UseArpeggiatorProps) {
  const [params, setParams] = useState<ArpeggiatorParams>(DEFAULT_ARPEGGIATOR_PARAMS)
  const heldNotesRef = useRef<number[]>([])
  const currentIndexRef = useRef<number>(0)
  const loopRef = useRef<Tone.Loop | null>(null)
  const currentPlayingNoteRef = useRef<number | null>(null)
  const isRunningRef = useRef<boolean>(false)

  // Use refs for callback functions to avoid stale closures in scheduled callbacks
  const playNoteRef = useRef(playNote)
  const stopNoteRef = useRef(stopNote)
  const playArpNoteRef = useRef(playArpNote)
  const stopArpNoteRef = useRef(stopArpNote)
  const getNoteTimeRef = useRef(getNoteTime)
  const getToneTimeRef = useRef(getToneTime)
  const setArpeggiatingRef = useRef(setArpeggiating)
  const paramsRef = useRef(params)

  // Keep refs updated
  const requestTransportStartRef = useRef(requestTransportStart)
  const releaseTransportRef = useRef(releaseTransport)

  useEffect(() => {
    playNoteRef.current = playNote
    stopNoteRef.current = stopNote
    playArpNoteRef.current = playArpNote
    stopArpNoteRef.current = stopArpNote
    getNoteTimeRef.current = getNoteTime
    getToneTimeRef.current = getToneTime
    setArpeggiatingRef.current = setArpeggiating
    requestTransportStartRef.current = requestTransportStart
    releaseTransportRef.current = releaseTransport
    paramsRef.current = params
  }, [playNote, stopNote, playArpNote, stopArpNote, getNoteTime, getToneTime, setArpeggiating, requestTransportStart, releaseTransport, params])

  // Generate sequence based on pattern and octaves
  const generateSequence = useCallback((): number[] => {
    const notes = [...heldNotesRef.current].sort((a, b) => a - b)
    if (notes.length === 0) return []

    const sequence: number[] = []

    // Add octave variations
    for (let oct = 0; oct < paramsRef.current.octaves; oct++) {
      const multiplier = Math.pow(2, oct)
      sequence.push(...notes.map((n) => n * multiplier))
    }

    switch (paramsRef.current.pattern) {
      case 'up':
        return sequence
      case 'down':
        return sequence.reverse()
      case 'upDown': {
        if (sequence.length <= 1) return sequence
        const upDown = [...sequence, ...sequence.slice(1, -1).reverse()]
        return upDown
      }
      case 'random':
        // Shuffle using Fisher-Yates
        for (let i = sequence.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[sequence[i], sequence[j]] = [sequence[j], sequence[i]]
        }
        return sequence
      default:
        return sequence
    }
  }, [])

  // Stop any currently playing note with optional time parameter
  const stopCurrentNote = useCallback((time?: number) => {
    if (currentPlayingNoteRef.current !== null) {
      stopArpNoteRef.current(currentPlayingNoteRef.current, time)
      currentPlayingNoteRef.current = null
    }
  }, [])

  // Start arpeggiator
  const startArp = useCallback(() => {
    if (isRunningRef.current) return
    isRunningRef.current = true

    if (requestTransportStartRef.current) {
      requestTransportStartRef.current(ARPEGGIATOR_CONSUMER_ID)
    } else if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start()
    }

    setArpeggiatingRef.current(true)

    const toneTime = getToneTimeRef.current(paramsRef.current.rate)
    currentIndexRef.current = 0

    loopRef.current = new Tone.Loop((time) => {
      const sequence = generateSequence()
      if (sequence.length === 0) return

      stopCurrentNote(time)

      const freq = sequence[currentIndexRef.current % sequence.length]
      currentPlayingNoteRef.current = freq

      playArpNoteRef.current(freq, time)

      currentIndexRef.current = (currentIndexRef.current + 1) % sequence.length
    }, toneTime)

    loopRef.current.start('+0')

    const sequence = generateSequence()
    if (sequence.length > 0) {
      const freq = sequence[0]
      currentPlayingNoteRef.current = freq
      playArpNoteRef.current(freq)
      currentIndexRef.current = 1
    }
  }, [generateSequence, stopCurrentNote])

  // Stop arpeggiator
  const stopArp = useCallback(() => {
    if (!isRunningRef.current) return
    isRunningRef.current = false

    if (loopRef.current) {
      loopRef.current.stop()
      loopRef.current.dispose()
      loopRef.current = null
    }

    stopCurrentNote()

    setArpeggiatingRef.current(false)

    if (releaseTransportRef.current) {
      releaseTransportRef.current(ARPEGGIATOR_CONSUMER_ID)
    }

    stopAllNotes()
  }, [stopAllNotes, stopCurrentNote])

  // Add note to arpeggiator
  const addNote = useCallback(
    (frequency: number) => {
      if (!heldNotesRef.current.includes(frequency)) {
        heldNotesRef.current.push(frequency)
      }

      // Start arp if enabled and this is the first note
      if (paramsRef.current.enabled && heldNotesRef.current.length === 1 && !isRunningRef.current) {
        startArp()
      }
    },
    [startArp]
  )

  // Remove note from arpeggiator
  const removeNote = useCallback(
    (frequency: number) => {
      heldNotesRef.current = heldNotesRef.current.filter((n) => n !== frequency)

      if (heldNotesRef.current.length === 0) {
        stopArp()
      }
    },
    [stopArp]
  )

  // Clear all notes
  const clearNotes = useCallback(() => {
    heldNotesRef.current = []
    stopArp()
  }, [stopArp])

  // Update params
  const setEnabled = useCallback(
    (enabled: boolean) => {
      setParams((p) => ({ ...p, enabled }))
      // Update the ref immediately so addNote can use it
      paramsRef.current = { ...paramsRef.current, enabled }
      
      if (!enabled) {
        stopArp()
      } else if (heldNotesRef.current.length > 0 && !isRunningRef.current) {
        startArp()
      }
    },
    [startArp, stopArp]
  )

  const setPattern = useCallback((pattern: ArpPattern) => {
    setParams((p) => ({ ...p, pattern }))
    paramsRef.current = { ...paramsRef.current, pattern }
    currentIndexRef.current = 0
  }, [])

  const setRate = useCallback(
    (rate: ArpRate) => {
      setParams((p) => ({ ...p, rate }))
      paramsRef.current = { ...paramsRef.current, rate }
      
      // Update loop interval if running
      if (isRunningRef.current && loopRef.current) {
        const toneTime = getToneTimeRef.current(rate)
        loopRef.current.interval = toneTime
      }
    },
    []
  )

  const setOctaves = useCallback((octaves: 1 | 2 | 3) => {
    setParams((p) => ({ ...p, octaves }))
    paramsRef.current = { ...paramsRef.current, octaves }
  }, [])

  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.stop()
        loopRef.current.dispose()
      }
      setArpeggiatingRef.current(false)
    }
  }, [])

  return {
    params,
    addNote,
    removeNote,
    clearNotes,
    setEnabled,
    setPattern,
    setRate,
    setOctaves,
    isActive: isRunningRef.current,
  }
}
