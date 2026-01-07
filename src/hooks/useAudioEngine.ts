import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import {
  WaveformType,
  LFOWaveform,
  NoiseType,
  ModulationTarget,
  DEFAULT_MASTER_PARAMS,
  DEFAULT_EFFECT_PARAMS,
  DEFAULT_OSCILLATOR_PARAMS,
  DEFAULT_LFO_PARAMS,
  DEFAULT_GLIDE_PARAMS,
  DEFAULT_FILTER_ENVELOPE_PARAMS,
  DEFAULT_CHORUS_PARAMS,
  DEFAULT_PHASER_PARAMS,
} from '../types/synth.types'

interface AudioEngineState {
  isInitialized: boolean
  activeNotes: number
}

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>({
    isInitialized: false,
    activeNotes: 0,
  })

  // Polyphonic synth (4 voices)
  const polySynthRef = useRef<Tone.PolySynth | null>(null)

  // Sub oscillator (monophonic, follows last played note)
  const subOscRef = useRef<Tone.Oscillator | null>(null)
  const subOscGainRef = useRef<Tone.Gain | null>(null)
  const subEnvRef = useRef<Tone.AmplitudeEnvelope | null>(null)

  // Noise generator (monophonic)
  const noiseRef = useRef<Tone.Noise | null>(null)
  const noiseGainRef = useRef<Tone.Gain | null>(null)
  const noiseEnvRef = useRef<Tone.AmplitudeEnvelope | null>(null)

  // Filter envelope (shared) - uses regular envelope scaled to frequency
  const filterEnvRef = useRef<Tone.Envelope | null>(null)
  const filterEnvScaleRef = useRef<Tone.Scale | null>(null)

  // LFO
  const lfoRef = useRef<Tone.LFO | null>(null)
  const lfoGainRef = useRef<Tone.Gain | null>(null)

  // Mixing
  const masterMixerRef = useRef<Tone.Gain | null>(null)
  const masterGainRef = useRef<Tone.Gain | null>(null)

  // Filters
  const lowpassRef = useRef<Tone.Filter | null>(null)
  const highpassRef = useRef<Tone.Filter | null>(null)
  // Base frequency signal for lowpass (allows modulation to be added)
  const lowpassBaseFreqRef = useRef<Tone.Signal<'frequency'> | null>(null)

  // Effects
  const distortionRef = useRef<Tone.Distortion | null>(null)
  const chorusRef = useRef<Tone.Chorus | null>(null)
  const phaserRef = useRef<Tone.Phaser | null>(null)
  const delayRef = useRef<Tone.FeedbackDelay | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)

  // Analysis
  const meterRef = useRef<Tone.Meter | null>(null)
  const analyserRef = useRef<Tone.Analyser | null>(null)
  const fftRef = useRef<Tone.FFT | null>(null)

  // State tracking
  const activeNotesRef = useRef<Set<number>>(new Set())
  const currentFrequencyRef = useRef<number>(440)
  const currentOctaveRef = useRef<number>(DEFAULT_MASTER_PARAMS.octave)
  const glideEnabledRef = useRef<boolean>(DEFAULT_GLIDE_PARAMS.enabled)
  const glideTimeRef = useRef<number>(DEFAULT_GLIDE_PARAMS.time)
  const pitchBendValueRef = useRef<number>(0)
  const pitchBendRangeRef = useRef<number>(2)
  const subOscOctaveRef = useRef<-1 | -2>(DEFAULT_OSCILLATOR_PARAMS.subOscOctave)
  const filterEnvAmountRef = useRef<number>(DEFAULT_FILTER_ENVELOPE_PARAMS.amount)
  const currentWaveformRef = useRef<WaveformType>(DEFAULT_MASTER_PARAMS.waveform)

  // Mono mode state
  const monoModeRef = useRef<boolean>(DEFAULT_MASTER_PARAMS.mono)
  const heldNotesStackRef = useRef<number[]>([])

  // Arpeggiator state (to prevent envelope release during arpeggio)
  const isArpeggiatingRef = useRef<boolean>(false)

  // LFO routing state
  const lfoToFilterRef = useRef<Tone.Gain | null>(null)

  const initializeAudio = useCallback(async () => {
    if (state.isInitialized) return

    await Tone.start()

    // Create master mixer (combines poly synth + sub + noise)
    masterMixerRef.current = new Tone.Gain(1)

    // Create 4-voice polyphonic synth
    polySynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: DEFAULT_MASTER_PARAMS.waveform,
      },
      envelope: {
        attack: DEFAULT_MASTER_PARAMS.attack,
        decay: 0.1,
        sustain: 0.9,
        release: DEFAULT_MASTER_PARAMS.release,
      },
    })
    polySynthRef.current.maxPolyphony = 4
    polySynthRef.current.connect(masterMixerRef.current)

    // Create sub oscillator (monophonic, follows last note)
    subOscRef.current = new Tone.Oscillator({
      type: 'sine',
      frequency: 220,
    })
    subOscGainRef.current = new Tone.Gain(DEFAULT_OSCILLATOR_PARAMS.subOscLevel)
    subEnvRef.current = new Tone.AmplitudeEnvelope({
      attack: DEFAULT_MASTER_PARAMS.attack,
      decay: 0.1,
      sustain: 0.9,
      release: DEFAULT_MASTER_PARAMS.release,
    })
    subOscRef.current.connect(subEnvRef.current)
    subEnvRef.current.connect(subOscGainRef.current)
    subOscGainRef.current.connect(masterMixerRef.current)

    // Create noise generator (monophonic)
    noiseRef.current = new Tone.Noise(DEFAULT_OSCILLATOR_PARAMS.noiseType)
    noiseGainRef.current = new Tone.Gain(DEFAULT_OSCILLATOR_PARAMS.noiseLevel)
    noiseEnvRef.current = new Tone.AmplitudeEnvelope({
      attack: DEFAULT_MASTER_PARAMS.attack,
      decay: 0.1,
      sustain: 0.9,
      release: DEFAULT_MASTER_PARAMS.release,
    })
    noiseRef.current.connect(noiseEnvRef.current)
    noiseEnvRef.current.connect(noiseGainRef.current)
    noiseGainRef.current.connect(masterMixerRef.current)

    // Create filter envelope (0-1 output, scaled to frequency offset)
    filterEnvRef.current = new Tone.Envelope({
      attack: DEFAULT_FILTER_ENVELOPE_PARAMS.attack,
      decay: DEFAULT_FILTER_ENVELOPE_PARAMS.decay,
      sustain: DEFAULT_FILTER_ENVELOPE_PARAMS.sustain,
      release: DEFAULT_FILTER_ENVELOPE_PARAMS.release,
    })
    // Scale envelope output (0-1) to frequency offset (0 to max sweep)
    // Initialize with max=0 so envelope has no effect until amount > 0
    filterEnvScaleRef.current = new Tone.Scale(0, DEFAULT_FILTER_ENVELOPE_PARAMS.amount * 8000)
    filterEnvRef.current.connect(filterEnvScaleRef.current)

    // Create LFO
    lfoRef.current = new Tone.LFO({
      frequency: DEFAULT_LFO_PARAMS.rate,
      min: -1,
      max: 1,
      type: DEFAULT_LFO_PARAMS.waveform,
    })
    lfoGainRef.current = new Tone.Gain(DEFAULT_LFO_PARAMS.depth)

    // LFO routing gains (for modulation targets)
    lfoToFilterRef.current = new Tone.Gain(0)

    // Create filters
    // Use a base frequency signal that we can modulate
    lowpassBaseFreqRef.current = new Tone.Signal({
      value: DEFAULT_EFFECT_PARAMS.lowpass.frequency,
      units: 'frequency',
    })
    
    // Initialize filter with frequency: 0 so the Signal is the sole source
    // The base frequency Signal will control the actual frequency
    lowpassRef.current = new Tone.Filter({
      frequency: 0,
      type: 'lowpass',
      Q: DEFAULT_EFFECT_PARAMS.lowpass.Q,
    })
    
    // Connect base frequency signal to filter
    lowpassBaseFreqRef.current.connect(lowpassRef.current.frequency)

    highpassRef.current = new Tone.Filter({
      frequency: DEFAULT_EFFECT_PARAMS.highpass.frequency,
      type: 'highpass',
      Q: DEFAULT_EFFECT_PARAMS.highpass.Q,
    })

    // Create effects
    distortionRef.current = new Tone.Distortion({
      distortion: DEFAULT_EFFECT_PARAMS.distortion.amount,
      wet: DEFAULT_EFFECT_PARAMS.distortion.wet,
    })

    chorusRef.current = new Tone.Chorus({
      frequency: DEFAULT_CHORUS_PARAMS.rate,
      depth: DEFAULT_CHORUS_PARAMS.depth,
      wet: DEFAULT_CHORUS_PARAMS.wet,
    })

    phaserRef.current = new Tone.Phaser({
      frequency: DEFAULT_PHASER_PARAMS.rate,
      octaves: 3,
      baseFrequency: 350,
      wet: DEFAULT_PHASER_PARAMS.wet,
    })

    delayRef.current = new Tone.FeedbackDelay({
      delayTime: DEFAULT_EFFECT_PARAMS.delay.time,
      feedback: DEFAULT_EFFECT_PARAMS.delay.feedback,
      wet: DEFAULT_EFFECT_PARAMS.delay.wet,
    })

    reverbRef.current = new Tone.Reverb({
      decay: DEFAULT_EFFECT_PARAMS.reverb.decay,
      wet: DEFAULT_EFFECT_PARAMS.reverb.wet,
    })

    // Create analysis nodes
    meterRef.current = new Tone.Meter()
    analyserRef.current = new Tone.Analyser('waveform', 256)
    fftRef.current = new Tone.FFT(256)

    // Master gain
    masterGainRef.current = new Tone.Gain(Tone.dbToGain(DEFAULT_MASTER_PARAMS.volume))

    // Connect LFO routing
    lfoRef.current.connect(lfoGainRef.current)
    lfoGainRef.current.connect(lfoToFilterRef.current)

    // Connect LFO to filter frequency for filter cutoff modulation
    // This ADDS to the base frequency set by setLowpassFrequency
    lfoToFilterRef.current.connect(lowpassRef.current.frequency)
    
    // Connect filter envelope to filter frequency
    // The envelope output (scaled to 0-5000 Hz) adds to the base frequency
    filterEnvScaleRef.current.connect(lowpassRef.current.frequency)

    // Signal chain: mixer -> filters -> effects -> output
    masterMixerRef.current.chain(
      lowpassRef.current,
      highpassRef.current,
      distortionRef.current,
      chorusRef.current,
      phaserRef.current,
      delayRef.current,
      reverbRef.current,
      masterGainRef.current,
      meterRef.current,
      analyserRef.current,
      fftRef.current,
      Tone.getDestination()
    )

    // Start oscillators
    subOscRef.current.start()
    noiseRef.current.start()
    lfoRef.current.start()
    chorusRef.current.start()

    setState({ isInitialized: true, activeNotes: 0 })
  }, [state.isInitialized])

  // Calculate the actual frequency with pitch bend applied
  const getFrequencyWithBend = useCallback((baseFreq: number) => {
    const bendSemitones = pitchBendValueRef.current * pitchBendRangeRef.current
    return baseFreq * Math.pow(2, bendSemitones / 12)
  }, [])

  // Mono mode play note logic
  const playNoteMono = useCallback(
    (frequency: number) => {
      if (!polySynthRef.current) return

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()
      const isFirstNote = heldNotesStackRef.current.length === 0

      // Add to held notes stack
      if (!heldNotesStackRef.current.includes(frequency)) {
        heldNotesStackRef.current.push(frequency)
      }

      // If there was a previous note, release it (but don't release envelopes)
      if (!isFirstNote && activeNotesRef.current.size > 0) {
        const prevFreq = Array.from(activeNotesRef.current)[0]
        const prevTargetFreq = getFrequencyWithBend(prevFreq)
        const prevNote = Tone.Frequency(prevTargetFreq).toNote()
        polySynthRef.current.triggerRelease(prevNote, Tone.now())
        activeNotesRef.current.delete(prevFreq)
      }

      // Trigger the new note
      if (isFirstNote || !glideEnabledRef.current) {
        polySynthRef.current.triggerAttack(note, Tone.now())
      } else {
        // With glide enabled, use portamento
        polySynthRef.current.triggerAttack(note, Tone.now())
      }

      activeNotesRef.current.clear()
      activeNotesRef.current.add(frequency)
      currentFrequencyRef.current = frequency

      // Update sub oscillator
      if (subOscRef.current && subEnvRef.current) {
        const subFreq = targetFreq / Math.pow(2, Math.abs(subOscOctaveRef.current))
        if (glideEnabledRef.current && !isFirstNote) {
          subOscRef.current.frequency.rampTo(subFreq, glideTimeRef.current)
        } else {
          subOscRef.current.frequency.value = subFreq
        }
        if (isFirstNote) {
          subEnvRef.current.triggerAttack()
        }
      }

      // Trigger envelopes only on first note
      if (isFirstNote) {
        noiseEnvRef.current?.triggerAttack()
        filterEnvRef.current?.triggerAttack()
      }

      setState((s) => ({ ...s, activeNotes: 1 }))
    },
    [getFrequencyWithBend]
  )

  // Mono mode stop note logic
  const stopNoteMono = useCallback(
    (frequency: number) => {
      if (!polySynthRef.current) return

      // Remove from held notes stack
      heldNotesStackRef.current = heldNotesStackRef.current.filter((f) => f !== frequency)

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()

      // Release the current note
      polySynthRef.current.triggerRelease(note, Tone.now())
      activeNotesRef.current.delete(frequency)

      // If there are still held notes, retrigger the last one (last-note priority)
      if (heldNotesStackRef.current.length > 0) {
        const prevFreq = heldNotesStackRef.current[heldNotesStackRef.current.length - 1]
        const prevTargetFreq = getFrequencyWithBend(prevFreq)
        const prevNote = Tone.Frequency(prevTargetFreq).toNote()

        polySynthRef.current.triggerAttack(prevNote, Tone.now())
        activeNotesRef.current.add(prevFreq)
        currentFrequencyRef.current = prevFreq

        // Glide sub oscillator to previous note
        if (subOscRef.current && glideEnabledRef.current) {
          const subFreq = prevTargetFreq / Math.pow(2, Math.abs(subOscOctaveRef.current))
          subOscRef.current.frequency.rampTo(subFreq, glideTimeRef.current)
        }
      } else {
        // No more held notes, release envelopes
        subEnvRef.current?.triggerRelease()
        noiseEnvRef.current?.triggerRelease()
        filterEnvRef.current?.triggerRelease()
        setState((s) => ({ ...s, activeNotes: 0 }))
      }
    },
    [getFrequencyWithBend]
  )

  const playNote = useCallback(
    (frequency: number) => {
      if (!polySynthRef.current) return

      // Use mono mode logic if enabled
      if (monoModeRef.current) {
        playNoteMono(frequency)
        return
      }

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()

      // Trigger the polyphonic synth voice
      polySynthRef.current.triggerAttack(note, Tone.now())

      // Track active note
      activeNotesRef.current.add(frequency)
      currentFrequencyRef.current = frequency

      // Update sub oscillator to follow this note
      if (subOscRef.current && subEnvRef.current) {
        const subFreq = targetFreq / Math.pow(2, Math.abs(subOscOctaveRef.current))
        if (glideEnabledRef.current && activeNotesRef.current.size > 1) {
          subOscRef.current.frequency.rampTo(subFreq, glideTimeRef.current)
        } else {
          subOscRef.current.frequency.value = subFreq
        }
        // Trigger sub envelope if this is the first note
        if (activeNotesRef.current.size === 1) {
          subEnvRef.current.triggerAttack()
        }
      }

      // Trigger noise envelope if first note
      if (noiseEnvRef.current && activeNotesRef.current.size === 1) {
        noiseEnvRef.current.triggerAttack()
      }

      // Trigger filter envelope if first note
      if (filterEnvRef.current && activeNotesRef.current.size === 1) {
        filterEnvRef.current.triggerAttack()
      }

      setState((s) => ({ ...s, activeNotes: activeNotesRef.current.size }))
    },
    [getFrequencyWithBend, playNoteMono]
  )

  const stopNote = useCallback(
    (frequency: number) => {
      if (!polySynthRef.current) return

      // Use mono mode logic if enabled
      if (monoModeRef.current) {
        stopNoteMono(frequency)
        return
      }

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()

      // Release the specific voice
      polySynthRef.current.triggerRelease(note, Tone.now())

      // Remove from active notes
      activeNotesRef.current.delete(frequency)

      // If no notes left and not arpeggiating, release sub/noise/filter envelopes
      if (activeNotesRef.current.size === 0 && !isArpeggiatingRef.current) {
        subEnvRef.current?.triggerRelease()
        noiseEnvRef.current?.triggerRelease()
        filterEnvRef.current?.triggerRelease()
      }

      setState((s) => ({ ...s, activeNotes: activeNotesRef.current.size }))
    },
    [getFrequencyWithBend, stopNoteMono]
  )

  // Release all notes
  const stopAllNotes = useCallback(() => {
    if (!polySynthRef.current) return
    polySynthRef.current.releaseAll()
    activeNotesRef.current.clear()
    heldNotesStackRef.current = []
    if (!isArpeggiatingRef.current) {
      subEnvRef.current?.triggerRelease()
      noiseEnvRef.current?.triggerRelease()
      filterEnvRef.current?.triggerRelease()
    }
    setState((s) => ({ ...s, activeNotes: 0 }))
  }, [])

  const playArpNote = useCallback(
    (frequency: number, time?: number) => {
      if (!polySynthRef.current) return

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()
      const triggerTime = time ?? Tone.now()

      polySynthRef.current.triggerAttack(note, triggerTime)

      if (subOscRef.current && subEnvRef.current) {
        const subFreq = targetFreq / Math.pow(2, Math.abs(subOscOctaveRef.current))
        subOscRef.current.frequency.setValueAtTime(subFreq, triggerTime)
        subEnvRef.current.triggerAttack(triggerTime)
      }

      noiseEnvRef.current?.triggerAttack(triggerTime)
      filterEnvRef.current?.triggerAttack(triggerTime)
    },
    [getFrequencyWithBend]
  )

  const stopArpNote = useCallback(
    (frequency: number, time?: number) => {
      if (!polySynthRef.current) return

      const targetFreq = getFrequencyWithBend(frequency)
      const note = Tone.Frequency(targetFreq).toNote()
      const releaseTime = time ?? Tone.now()

      polySynthRef.current.triggerRelease(note, releaseTime)
    },
    [getFrequencyWithBend]
  )

  // Set arpeggiating state (called by arpeggiator hook)
  const setArpeggiating = useCallback((active: boolean) => {
    isArpeggiatingRef.current = active
    if (!active) {
      // When arpeggiator stops, release envelopes if no notes held
      if (activeNotesRef.current.size === 0) {
        subEnvRef.current?.triggerRelease()
        noiseEnvRef.current?.triggerRelease()
        filterEnvRef.current?.triggerRelease()
      }
    }
  }, [])

  // Master controls
  const setVolume = useCallback((volume: number) => {
    if (!masterGainRef.current) return
    masterGainRef.current.gain.rampTo(Tone.dbToGain(volume), 0.1)
  }, [])

  const setAttack = useCallback((attack: number) => {
    if (!polySynthRef.current) return
    polySynthRef.current.set({ envelope: { attack } })
    if (subEnvRef.current) subEnvRef.current.attack = attack
    if (noiseEnvRef.current) noiseEnvRef.current.attack = attack
  }, [])

  const setRelease = useCallback((release: number) => {
    if (!polySynthRef.current) return
    polySynthRef.current.set({ envelope: { release } })
    if (subEnvRef.current) subEnvRef.current.release = release
    if (noiseEnvRef.current) noiseEnvRef.current.release = release
  }, [])

  const setWaveform = useCallback((waveform: WaveformType) => {
    if (!polySynthRef.current) return
    currentWaveformRef.current = waveform
    polySynthRef.current.set({ oscillator: { type: waveform } })
  }, [])

  const setOctave = useCallback((octave: number) => {
    currentOctaveRef.current = octave
  }, [])

  // Mono mode control
  const setMonoMode = useCallback((enabled: boolean) => {
    monoModeRef.current = enabled
    if (enabled) {
      // Clear poly notes and switch to mono behavior
      if (polySynthRef.current && activeNotesRef.current.size > 1) {
        polySynthRef.current.releaseAll()
        activeNotesRef.current.clear()
        heldNotesStackRef.current = []
      }
    } else {
      // Clear mono state when switching to poly
      heldNotesStackRef.current = []
    }
  }, [])

  // Oscillator controls
  const setSubOscLevel = useCallback((level: number) => {
    if (!subOscGainRef.current) return
    subOscGainRef.current.gain.rampTo(level, 0.1)
  }, [])

  const setSubOscOctave = useCallback((octave: -1 | -2) => {
    subOscOctaveRef.current = octave
    if (!subOscRef.current) return
    const subFreq = currentFrequencyRef.current / Math.pow(2, Math.abs(octave))
    subOscRef.current.frequency.value = subFreq
  }, [])

  const setNoiseLevel = useCallback((level: number) => {
    if (!noiseGainRef.current) return
    noiseGainRef.current.gain.rampTo(level, 0.1)
  }, [])

  const setNoiseType = useCallback((type: NoiseType) => {
    if (!noiseRef.current) return
    noiseRef.current.type = type
  }, [])

  // Glide controls
  const setGlideEnabled = useCallback((enabled: boolean) => {
    glideEnabledRef.current = enabled
    if (polySynthRef.current) {
      polySynthRef.current.set({
        portamento: enabled ? glideTimeRef.current : 0,
      })
    }
  }, [])

  const setGlideTime = useCallback((time: number) => {
    glideTimeRef.current = time
    if (polySynthRef.current && glideEnabledRef.current) {
      polySynthRef.current.set({ portamento: time })
    }
  }, [])

  // Pitch bend controls
  const setPitchBend = useCallback(
    (value: number) => {
      pitchBendValueRef.current = value

      // Apply pitch bend to PolySynth via detune (cents = semitones * 100)
      if (polySynthRef.current) {
        const cents = value * pitchBendRangeRef.current * 100
        polySynthRef.current.set({ detune: cents })
      }

      // Also apply to sub oscillator
      if (subOscRef.current) {
        const targetFreq = getFrequencyWithBend(currentFrequencyRef.current)
        const subFreq = targetFreq / Math.pow(2, Math.abs(subOscOctaveRef.current))
        subOscRef.current.frequency.rampTo(subFreq, 0.05)
      }
    },
    [getFrequencyWithBend]
  )

  const setPitchBendRange = useCallback((range: number) => {
    pitchBendRangeRef.current = range
  }, [])

  // LFO controls
  const setLFORate = useCallback((rate: number) => {
    if (!lfoRef.current) return
    lfoRef.current.frequency.rampTo(rate, 0.1)
  }, [])

  const setLFODepth = useCallback((depth: number) => {
    if (!lfoGainRef.current) return
    lfoGainRef.current.gain.rampTo(depth, 0.1)
  }, [])

  const setLFOWaveform = useCallback((waveform: LFOWaveform) => {
    if (!lfoRef.current) return
    lfoRef.current.type = waveform
  }, [])

  const LFO_FILTER_MAX_RANGE = 5000

  const setModRouting = useCallback((target: ModulationTarget, amount: number, enabled: boolean) => {
    const scaledAmount = enabled ? amount : 0

    switch (target) {
      case 'filterCutoff':
        if (lfoToFilterRef.current) {
          lfoToFilterRef.current.gain.rampTo(scaledAmount * LFO_FILTER_MAX_RANGE, 0.1)
        }
        break
    }
  }, [])

  // Filter controls - using rampTo for smooth transitions (prevents clicks)
  const setLowpassFrequency = useCallback((frequency: number) => {
    if (!lowpassBaseFreqRef.current) return
    // Ramp the base frequency signal (modulation adds to this)
    lowpassBaseFreqRef.current.rampTo(frequency, 0.05)
  }, [])

  const setLowpassQ = useCallback((q: number) => {
    if (!lowpassRef.current) return
    lowpassRef.current.Q.rampTo(q, 0.1)
  }, [])

  const setHighpassFrequency = useCallback((frequency: number) => {
    if (!highpassRef.current) return
    highpassRef.current.frequency.rampTo(frequency, 0.05)
  }, [])

  const setHighpassQ = useCallback((q: number) => {
    if (!highpassRef.current) return
    highpassRef.current.Q.rampTo(q, 0.1)
  }, [])

  // Filter envelope controls
  const setFilterEnvAttack = useCallback((attack: number) => {
    if (!filterEnvRef.current) return
    filterEnvRef.current.attack = attack
  }, [])

  const setFilterEnvDecay = useCallback((decay: number) => {
    if (!filterEnvRef.current) return
    filterEnvRef.current.decay = decay
  }, [])

  const setFilterEnvSustain = useCallback((sustain: number) => {
    if (!filterEnvRef.current) return
    filterEnvRef.current.sustain = sustain
  }, [])

  const setFilterEnvRelease = useCallback((release: number) => {
    if (!filterEnvRef.current) return
    filterEnvRef.current.release = release
  }, [])

  const setFilterEnvAmount = useCallback((amount: number) => {
    if (!filterEnvScaleRef.current) return
    filterEnvAmountRef.current = amount
    // Scale from 0-1 to 0-8000 Hz max sweep
    filterEnvScaleRef.current.max = amount * 8000
  }, [])

  // Distortion controls
  const setDistortionAmount = useCallback((amount: number) => {
    if (!distortionRef.current) return
    distortionRef.current.distortion = amount
  }, [])

  const setDistortionWet = useCallback((wet: number) => {
    if (!distortionRef.current) return
    distortionRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Chorus controls
  const setChorusRate = useCallback((rate: number) => {
    if (!chorusRef.current) return
    chorusRef.current.frequency.rampTo(rate, 0.1)
  }, [])

  const setChorusDepth = useCallback((depth: number) => {
    if (!chorusRef.current) return
    chorusRef.current.depth = depth
  }, [])

  const setChorusWet = useCallback((wet: number) => {
    if (!chorusRef.current) return
    chorusRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Phaser controls
  const setPhaserRate = useCallback((rate: number) => {
    if (!phaserRef.current) return
    phaserRef.current.frequency.rampTo(rate, 0.1)
  }, [])

  const setPhaserDepth = useCallback((depth: number) => {
    if (!phaserRef.current) return
    phaserRef.current.octaves = depth * 6
  }, [])

  const setPhaserWet = useCallback((wet: number) => {
    if (!phaserRef.current) return
    phaserRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Delay controls
  const setDelayTime = useCallback((time: number) => {
    if (!delayRef.current) return
    delayRef.current.delayTime.rampTo(time, 0.1)
  }, [])

  const setDelayFeedback = useCallback((feedback: number) => {
    if (!delayRef.current) return
    delayRef.current.feedback.rampTo(feedback, 0.1)
  }, [])

  const setDelayWet = useCallback((wet: number) => {
    if (!delayRef.current) return
    delayRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Reverb controls
  const setReverbDecay = useCallback((decay: number) => {
    if (!reverbRef.current) return
    reverbRef.current.decay = decay
  }, [])

  const setReverbWet = useCallback((wet: number) => {
    if (!reverbRef.current) return
    reverbRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Get meter level
  const getMeterLevel = useCallback((): number => {
    if (!meterRef.current) return -60
    const value = meterRef.current.getValue()
    return typeof value === 'number' ? value : value[0]
  }, [])

  // Get waveform data
  const getWaveformData = useCallback((): Float32Array => {
    if (!analyserRef.current) return new Float32Array(256)
    return analyserRef.current.getValue() as Float32Array
  }, [])

  // Get FFT data for spectrum analyzer
  const getFFTData = useCallback((): Float32Array => {
    if (!fftRef.current) return new Float32Array(256)
    return fftRef.current.getValue() as Float32Array
  }, [])

  // Get current frequency (for arpeggiator)
  const getCurrentFrequency = useCallback((): number => {
    return currentFrequencyRef.current
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      polySynthRef.current?.dispose()
      subOscRef.current?.dispose()
      subOscGainRef.current?.dispose()
      subEnvRef.current?.dispose()
      noiseRef.current?.dispose()
      noiseGainRef.current?.dispose()
      noiseEnvRef.current?.dispose()
      filterEnvRef.current?.dispose()
      filterEnvScaleRef.current?.dispose()
      lfoRef.current?.dispose()
      lfoGainRef.current?.dispose()
      lfoToFilterRef.current?.dispose()
      masterMixerRef.current?.dispose()
      masterGainRef.current?.dispose()
      lowpassRef.current?.dispose()
      lowpassBaseFreqRef.current?.dispose()
      highpassRef.current?.dispose()
      distortionRef.current?.dispose()
      chorusRef.current?.dispose()
      phaserRef.current?.dispose()
      delayRef.current?.dispose()
      reverbRef.current?.dispose()
      meterRef.current?.dispose()
      analyserRef.current?.dispose()
      fftRef.current?.dispose()
    }
  }, [])

  return {
    isInitialized: state.isInitialized,
    isPlaying: state.activeNotes > 0,
    activeNotes: state.activeNotes,
    initializeAudio,
    playNote,
    stopNote,
    stopAllNotes,
    playArpNote,
    stopArpNote,
    setArpeggiating,
    // Master
    setVolume,
    setAttack,
    setRelease,
    setWaveform,
    setOctave,
    setMonoMode,
    // Oscillator
    setSubOscLevel,
    setSubOscOctave,
    setNoiseLevel,
    setNoiseType,
    // Glide
    setGlideEnabled,
    setGlideTime,
    // Pitch bend
    setPitchBend,
    setPitchBendRange,
    // LFO
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setModRouting,
    // Filter
    setLowpassFrequency,
    setLowpassQ,
    setHighpassFrequency,
    setHighpassQ,
    // Filter envelope
    setFilterEnvAttack,
    setFilterEnvDecay,
    setFilterEnvSustain,
    setFilterEnvRelease,
    setFilterEnvAmount,
    // Distortion
    setDistortionAmount,
    setDistortionWet,
    // Chorus
    setChorusRate,
    setChorusDepth,
    setChorusWet,
    // Phaser
    setPhaserRate,
    setPhaserDepth,
    setPhaserWet,
    // Delay
    setDelayTime,
    setDelayFeedback,
    setDelayWet,
    // Reverb
    setReverbDecay,
    setReverbWet,
    // Analysis
    getMeterLevel,
    getWaveformData,
    getFFTData,
    getCurrentFrequency,
  }
}
