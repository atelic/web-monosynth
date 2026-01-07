import {
  SynthPresetParams,
  WaveformType,
  NoiseType,
  LFOWaveform,
  ModulationTarget,
  ArpPattern,
  ArpRate,
  PresetCategory,
  ArpeggiatorParams,
  Preset,
} from '../types/synth.types'

export interface SynthStateContextValue {
  params: SynthPresetParams
  pitchBendValue: number
  activeKeys: Set<string>
  isInitialized: boolean
  isPlaying: boolean

  tempo: {
    bpm: number
    isPlaying: boolean
  }

  arpeggiator: {
    params: ArpeggiatorParams
  }

  presets: {
    presets: Preset[]
    currentPresetId: string | null
  }
}

export interface SynthActionsContextValue {
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

  setBpm: (bpm: number) => void
  tapTempo: () => void
  toggleTransport: () => void
  startTransport: () => void
  stopTransport: () => void
  getNoteTime: (rate: ArpRate) => number

  setArpEnabled: (enabled: boolean) => void
  setArpPattern: (pattern: ArpPattern) => void
  setArpRate: (rate: ArpRate) => void
  setArpOctaves: (octaves: 1 | 2 | 3) => void
  clearArpNotes: () => void

  loadPreset: (id: string) => SynthPresetParams | null
  savePreset: (name: string, category: PresetCategory, params: SynthPresetParams) => void
  deletePreset: (id: string) => boolean
  initPreset: () => SynthPresetParams
  isUserPreset: (id: string) => boolean
  handleReset: () => void
  getCurrentParams: () => SynthPresetParams
}

export type SynthContextValue = SynthStateContextValue & SynthActionsContextValue
