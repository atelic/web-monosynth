import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { usePresets, DEFAULT_PRESET_PARAMS } from '../hooks/usePresets'
import { useTempo } from '../hooks/useTempo'
import { useArpeggiator } from '../hooks/useArpeggiator'
import {
  SynthPresetParams,
  WaveformType,
  NoiseType,
  LFOWaveform,
  ModulationTarget,
  ArpPattern,
  ArpRate,
  PresetCategory,
} from '../types/synth.types'

interface SynthContextValue {
  // State
  params: SynthPresetParams
  setParams: React.Dispatch<React.SetStateAction<SynthPresetParams>>
  pitchBendValue: number
  activeKeys: Set<string>
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>
  isInitialized: boolean
  isPlaying: boolean

  // Core audio functions
  initializeAudio: () => Promise<void>
  playNote: (frequency: number) => void
  stopNote: (frequency: number) => void
  handleNoteOn: (code: string) => void
  handleNoteOff: (code: string) => void
  handleOctaveChange: (direction: 'up' | 'down') => void

  // Parameter setters
  setVolume: (value: number) => void
  setAttack: (value: number) => void
  setRelease: (value: number) => void
  setWaveform: (waveform: WaveformType) => void
  setOctave: (octave: number) => void
  setMonoMode: (enabled: boolean) => void
  setSubOscLevel: (level: number) => void
  setSubOscOctave: (octave: -1 | -2) => void
  setNoiseLevel: (level: number) => void
  setNoiseType: (type: NoiseType) => void
  setGlideEnabled: (enabled: boolean) => void
  setGlideTime: (time: number) => void
  setPitchBend: (value: number) => void
  setPitchBendRange: (range: number) => void
  setLFORate: (rate: number) => void
  setLFODepth: (depth: number) => void
  setLFOWaveform: (waveform: LFOWaveform) => void
  setModRouting: (target: ModulationTarget, amount: number, enabled: boolean) => void
  setLowpassFrequency: (frequency: number) => void
  setLowpassQ: (q: number) => void
  setHighpassFrequency: (frequency: number) => void
  setHighpassQ: (q: number) => void
  setFilterEnvAttack: (attack: number) => void
  setFilterEnvDecay: (decay: number) => void
  setFilterEnvSustain: (sustain: number) => void
  setFilterEnvRelease: (release: number) => void
  setFilterEnvAmount: (amount: number) => void
  setDistortionAmount: (amount: number) => void
  setDistortionWet: (wet: number) => void
  setChorusRate: (rate: number) => void
  setChorusDepth: (depth: number) => void
  setChorusWet: (wet: number) => void
  setPhaserRate: (rate: number) => void
  setPhaserDepth: (depth: number) => void
  setPhaserWet: (wet: number) => void
  setDelayTime: (time: number) => void
  setDelayFeedback: (feedback: number) => void
  setDelayWet: (wet: number) => void
  setReverbDecay: (decay: number) => void
  setReverbWet: (wet: number) => void

  // Visualizer data
  getMeterLevel: () => number
  getWaveformData: () => Float32Array
  getFFTData: () => Float32Array

  // Tempo
  tempo: {
    bpm: number
    isPlaying: boolean
    setBpm: (bpm: number) => void
    tapTempo: () => void
    toggleTransport: () => void
    startTransport: () => void
    stopTransport: () => void
    getNoteTime: (rate: ArpRate) => number
  }

  // Arpeggiator
  arpeggiator: {
    params: {
      enabled: boolean
      pattern: ArpPattern
      rate: ArpRate
      octaves: 1 | 2 | 3
    }
    setEnabled: (enabled: boolean) => void
    setPattern: (pattern: ArpPattern) => void
    setRate: (rate: ArpRate) => void
    setOctaves: (octaves: 1 | 2 | 3) => void
    clearNotes: () => void
  }

  // Presets
  presets: {
    presets: Array<{ id: string; name: string; category: PresetCategory; params: SynthPresetParams }>
    currentPresetId: string | null
    loadPreset: (id: string) => SynthPresetParams | null
    savePreset: (name: string, category: PresetCategory, params: SynthPresetParams) => void
    deletePreset: (id: string) => boolean
    initPreset: () => SynthPresetParams
    isUserPreset: (id: string) => boolean
  }

  // Handlers
  handleLoadPreset: (id: string) => SynthPresetParams | null
  handleInitPreset: () => SynthPresetParams
  handleReset: () => void
  getCurrentParams: () => SynthPresetParams
  handleRoutingChange: (target: ModulationTarget, amount: number, enabled: boolean) => void
}

const SynthContext = createContext<SynthContextValue | null>(null)

export function useSynth(): SynthContextValue {
  const context = useContext(SynthContext)
  if (!context) {
    throw new Error('useSynth must be used within a SynthProvider')
  }
  return context
}

interface SynthProviderProps {
  children: ReactNode
  getFrequency: (code: string, octave: number) => number | null
}

export function SynthProvider({ children, getFrequency }: SynthProviderProps) {
  // Audio engine
  const audioEngine = useAudioEngine()
  const {
    isInitialized,
    isPlaying,
    initializeAudio,
    playNote: audioPlayNote,
    stopNote: audioStopNote,
    stopAllNotes,
    setVolume,
    setAttack,
    setRelease,
    setWaveform,
    setOctave,
    setMonoMode,
    setSubOscLevel,
    setSubOscOctave,
    setNoiseLevel,
    setNoiseType,
    setGlideEnabled,
    setGlideTime,
    setPitchBend,
    setPitchBendRange,
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setModRouting,
    setLowpassFrequency,
    setLowpassQ,
    setHighpassFrequency,
    setHighpassQ,
    setFilterEnvAttack,
    setFilterEnvDecay,
    setFilterEnvSustain,
    setFilterEnvRelease,
    setFilterEnvAmount,
    setDistortionAmount,
    setDistortionWet,
    setChorusRate,
    setChorusDepth,
    setChorusWet,
    setPhaserRate,
    setPhaserDepth,
    setPhaserWet,
    setDelayTime,
    setDelayFeedback,
    setDelayWet,
    setReverbDecay,
    setReverbWet,
    getMeterLevel,
    getWaveformData,
    getFFTData,
    setArpeggiating,
  } = audioEngine

  // State
  const [params, setParams] = useState<SynthPresetParams>(DEFAULT_PRESET_PARAMS)
  const [pitchBendValue, setPitchBendValue] = useState(0)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  
  // Track frequencies of currently held keys (to handle octave changes while notes are held)
  const [activeKeyFrequencies, setActiveKeyFrequencies] = useState<Map<string, number>>(new Map())

  // Presets
  const presetsHook = usePresets()

  // Tempo
  const tempoHook = useTempo()

  // Arpeggiator
  const arpeggiatorHook = useArpeggiator({
    playNote: audioPlayNote,
    stopNote: audioStopNote,
    stopAllNotes,
    getNoteTime: tempoHook.getNoteTime,
    getToneTime: tempoHook.getToneTime,
    setArpeggiating,
  })

  const arpEnabled = arpeggiatorHook.params.enabled

  // Play note handler - routes through arpeggiator if enabled
  const playNote = useCallback(
    (frequency: number) => {
      if (arpEnabled) {
        arpeggiatorHook.addNote(frequency)
      } else {
        audioPlayNote(frequency)
      }
    },
    [arpEnabled, arpeggiatorHook, audioPlayNote]
  )

  const stopNote = useCallback(
    (frequency: number) => {
      if (arpEnabled) {
        arpeggiatorHook.removeNote(frequency)
      } else {
        audioStopNote(frequency)
      }
    },
    [arpEnabled, arpeggiatorHook, audioStopNote]
  )

  const handleNoteOn = useCallback(
    (code: string) => {
      const freq = getFrequency(code, params.master.octave)
      if (freq) {
        playNote(freq)
        setActiveKeys((prev) => new Set(prev).add(code))
        // Track the frequency for this key so we can stop the correct note later
        setActiveKeyFrequencies((prev) => {
          const next = new Map(prev)
          next.set(code, freq)
          return next
        })
      }
    },
    [params.master.octave, playNote, getFrequency]
  )

  const handleNoteOff = useCallback(
    (code: string) => {
      // Use the stored frequency from when the note was triggered, not the current octave
      const freq = activeKeyFrequencies.get(code)
      if (freq) {
        stopNote(freq)
        setActiveKeys((prev) => {
          const next = new Set(prev)
          next.delete(code)
          return next
        })
        setActiveKeyFrequencies((prev) => {
          const next = new Map(prev)
          next.delete(code)
          return next
        })
      }
    },
    [activeKeyFrequencies, stopNote]
  )

  const handleOctaveChange = useCallback(
    (direction: 'up' | 'down') => {
      const newOctave = Math.max(
        0,
        Math.min(5, params.master.octave + (direction === 'up' ? 1 : -1))
      )
      setParams((prev) => ({
        ...prev,
        master: { ...prev.master, octave: newOctave },
      }))
      setOctave(newOctave)
    },
    [params.master.octave, setOctave]
  )

  // Sync all params to audio engine
  const syncParamsToEngine = useCallback(
    (loadedParams: SynthPresetParams) => {
      setVolume(loadedParams.master.volume)
      setAttack(loadedParams.master.attack)
      setRelease(loadedParams.master.release)
      setWaveform(loadedParams.master.waveform)
      setOctave(loadedParams.master.octave)
      setMonoMode(loadedParams.master.mono)
      setSubOscLevel(loadedParams.oscillator.subOscLevel)
      setSubOscOctave(loadedParams.oscillator.subOscOctave)
      setNoiseLevel(loadedParams.oscillator.noiseLevel)
      setNoiseType(loadedParams.oscillator.noiseType)
      setGlideEnabled(loadedParams.glide.enabled)
      setGlideTime(loadedParams.glide.time)
      setPitchBendRange(loadedParams.pitchBendRange)
      setLFORate(loadedParams.lfo.rate)
      setLFODepth(loadedParams.lfo.depth)
      setLFOWaveform(loadedParams.lfo.waveform)
      loadedParams.modRouting.forEach((r) => {
        setModRouting(r.target, r.amount, r.enabled)
      })
      setLowpassFrequency(loadedParams.effects.lowpass.frequency)
      setLowpassQ(loadedParams.effects.lowpass.Q)
      setHighpassFrequency(loadedParams.effects.highpass.frequency)
      setHighpassQ(loadedParams.effects.highpass.Q)
      setFilterEnvAttack(loadedParams.filterEnvelope.attack)
      setFilterEnvDecay(loadedParams.filterEnvelope.decay)
      setFilterEnvSustain(loadedParams.filterEnvelope.sustain)
      setFilterEnvRelease(loadedParams.filterEnvelope.release)
      setFilterEnvAmount(loadedParams.filterEnvelope.amount)
      setDistortionAmount(loadedParams.effects.distortion.amount)
      setDistortionWet(loadedParams.effects.distortion.wet)
      setChorusRate(loadedParams.chorus.rate)
      setChorusDepth(loadedParams.chorus.depth)
      setChorusWet(loadedParams.chorus.wet)
      setPhaserRate(loadedParams.phaser.rate)
      setPhaserDepth(loadedParams.phaser.depth)
      setPhaserWet(loadedParams.phaser.wet)
      setDelayTime(loadedParams.effects.delay.time)
      setDelayFeedback(loadedParams.effects.delay.feedback)
      setDelayWet(loadedParams.effects.delay.wet)
      setReverbDecay(loadedParams.effects.reverb.decay)
      setReverbWet(loadedParams.effects.reverb.wet)
      tempoHook.setBpm(loadedParams.tempo.bpm)
      arpeggiatorHook.setEnabled(loadedParams.arpeggiator.enabled)
      arpeggiatorHook.setPattern(loadedParams.arpeggiator.pattern)
      arpeggiatorHook.setRate(loadedParams.arpeggiator.rate)
      arpeggiatorHook.setOctaves(loadedParams.arpeggiator.octaves)
    },
    [
      setVolume, setAttack, setRelease, setWaveform, setOctave, setMonoMode,
      setSubOscLevel, setSubOscOctave, setNoiseLevel, setNoiseType,
      setGlideEnabled, setGlideTime, setPitchBendRange,
      setLFORate, setLFODepth, setLFOWaveform, setModRouting,
      setLowpassFrequency, setLowpassQ, setHighpassFrequency, setHighpassQ,
      setFilterEnvAttack, setFilterEnvDecay, setFilterEnvSustain, setFilterEnvRelease, setFilterEnvAmount,
      setDistortionAmount, setDistortionWet,
      setChorusRate, setChorusDepth, setChorusWet,
      setPhaserRate, setPhaserDepth, setPhaserWet,
      setDelayTime, setDelayFeedback, setDelayWet,
      setReverbDecay, setReverbWet,
      tempoHook, arpeggiatorHook
    ]
  )

  const handleLoadPreset = useCallback(
    (id: string) => {
      const loadedParams = presetsHook.loadPreset(id)
      if (loadedParams) {
        setParams(loadedParams)
        syncParamsToEngine(loadedParams)
      }
      return loadedParams
    },
    [presetsHook, syncParamsToEngine]
  )

  const handleInitPreset = useCallback(() => {
    const initParams = presetsHook.initPreset()
    setParams(initParams)
    syncParamsToEngine(initParams)
    return initParams
  }, [presetsHook, syncParamsToEngine])

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PRESET_PARAMS)
    syncParamsToEngine(DEFAULT_PRESET_PARAMS)
    setPitchBendValue(0)
    setPitchBend(0)
  }, [syncParamsToEngine, setPitchBend])

  const getCurrentParams = useCallback((): SynthPresetParams => {
    return {
      ...params,
      arpeggiator: arpeggiatorHook.params,
      tempo: { bpm: tempoHook.bpm },
    }
  }, [params, arpeggiatorHook.params, tempoHook.bpm])

  const handleRoutingChange = useCallback(
    (target: ModulationTarget, amount: number, enabled: boolean) => {
      setParams((prev) => ({
        ...prev,
        modRouting: prev.modRouting.map((r) =>
          r.target === target ? { ...r, amount, enabled } : r
        ),
      }))
      setModRouting(target, amount, enabled)
    },
    [setModRouting]
  )

  // Pitch bend handler that updates both state and audio
  const handlePitchBend = useCallback(
    (value: number) => {
      setPitchBendValue(value)
      setPitchBend(value)
    },
    [setPitchBend]
  )

  // Pitch bend range handler that updates both state and audio
  const handlePitchBendRange = useCallback(
    (range: number) => {
      setParams((prev) => ({ ...prev, pitchBendRange: range }))
      setPitchBendRange(range)
    },
    [setPitchBendRange]
  )

  const value: SynthContextValue = {
    // State
    params,
    setParams,
    pitchBendValue,
    activeKeys,
    setActiveKeys,
    isInitialized,
    isPlaying,

    // Core audio functions
    initializeAudio,
    playNote,
    stopNote,
    handleNoteOn,
    handleNoteOff,
    handleOctaveChange,

    // Parameter setters
    setVolume,
    setAttack,
    setRelease,
    setWaveform,
    setOctave,
    setMonoMode,
    setSubOscLevel,
    setSubOscOctave,
    setNoiseLevel,
    setNoiseType,
    setGlideEnabled,
    setGlideTime,
    setPitchBend: handlePitchBend,
    setPitchBendRange: handlePitchBendRange,
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setModRouting,
    setLowpassFrequency,
    setLowpassQ,
    setHighpassFrequency,
    setHighpassQ,
    setFilterEnvAttack,
    setFilterEnvDecay,
    setFilterEnvSustain,
    setFilterEnvRelease,
    setFilterEnvAmount,
    setDistortionAmount,
    setDistortionWet,
    setChorusRate,
    setChorusDepth,
    setChorusWet,
    setPhaserRate,
    setPhaserDepth,
    setPhaserWet,
    setDelayTime,
    setDelayFeedback,
    setDelayWet,
    setReverbDecay,
    setReverbWet,

    // Visualizer data
    getMeterLevel,
    getWaveformData,
    getFFTData,

    // Tempo
    tempo: {
      bpm: tempoHook.bpm,
      isPlaying: tempoHook.isPlaying,
      setBpm: tempoHook.setBpm,
      tapTempo: tempoHook.tapTempo,
      toggleTransport: tempoHook.toggleTransport,
      startTransport: tempoHook.startTransport,
      stopTransport: tempoHook.stopTransport,
      getNoteTime: tempoHook.getNoteTime,
    },

    // Arpeggiator
    arpeggiator: {
      params: arpeggiatorHook.params,
      setEnabled: arpeggiatorHook.setEnabled,
      setPattern: arpeggiatorHook.setPattern,
      setRate: arpeggiatorHook.setRate,
      setOctaves: arpeggiatorHook.setOctaves,
      clearNotes: arpeggiatorHook.clearNotes,
    },

    // Presets
    presets: {
      presets: presetsHook.presets,
      currentPresetId: presetsHook.currentPresetId,
      loadPreset: presetsHook.loadPreset,
      savePreset: presetsHook.savePreset,
      deletePreset: presetsHook.deletePreset,
      initPreset: presetsHook.initPreset,
      isUserPreset: presetsHook.isUserPreset,
    },

    // Handlers
    handleLoadPreset,
    handleInitPreset,
    handleReset,
    getCurrentParams,
    handleRoutingChange,
  }

  return <SynthContext.Provider value={value}>{children}</SynthContext.Provider>
}
