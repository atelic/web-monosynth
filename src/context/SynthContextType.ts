import { createContext } from 'react'
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

export interface SynthContextValue {
  params: SynthPresetParams
  setParams: React.Dispatch<React.SetStateAction<SynthPresetParams>>
  pitchBendValue: number
  activeKeys: Set<string>
  setActiveKeys: React.Dispatch<React.SetStateAction<Set<string>>>
  isInitialized: boolean
  isPlaying: boolean

  initializeAudio: () => Promise<void>
  playNote: (frequency: number) => void
  stopNote: (frequency: number) => void
  handleNoteOn: (code: string) => void
  handleNoteOff: (code: string) => void
  handleOctaveChange: (direction: 'up' | 'down') => void

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

  getMeterLevel: () => number
  getWaveformData: () => Float32Array
  getFFTData: () => Float32Array

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

  presets: {
    presets: Array<{ id: string; name: string; category: PresetCategory; params: SynthPresetParams }>
    currentPresetId: string | null
    loadPreset: (id: string) => SynthPresetParams | null
    savePreset: (name: string, category: PresetCategory, params: SynthPresetParams) => void
    deletePreset: (id: string) => boolean
    initPreset: () => SynthPresetParams
    isUserPreset: (id: string) => boolean
  }

  handleLoadPreset: (id: string) => SynthPresetParams | null
  handleInitPreset: () => SynthPresetParams
  handleReset: () => void
  getCurrentParams: () => SynthPresetParams
  handleRoutingChange: (target: ModulationTarget, amount: number, enabled: boolean) => void
}

export const SynthContext = createContext<SynthContextValue | null>(null)
