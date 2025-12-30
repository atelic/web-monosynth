export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth'
export type LFOWaveform = 'sine' | 'triangle' | 'square' | 'sawtooth'
export type NoiseType = 'white' | 'pink'
export type ModulationTarget = 'filterCutoff' | 'pitch' | 'pulseWidth'
export type ArpPattern = 'up' | 'down' | 'upDown' | 'random'
export type ArpRate = '1/4' | '1/8' | '1/16' | '1/32'
export type PresetCategory = 'bass' | 'lead' | 'pad' | 'fx' | 'user'

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface KeyConfig {
  code: string
  noteName: NoteName
  isBlack: boolean
  frequencies: Record<number, number>
}

export interface EffectParams {
  lowpass: {
    frequency: number
    Q: number
  }
  highpass: {
    frequency: number
    Q: number
  }
  reverb: {
    decay: number
    wet: number
  }
  delay: {
    time: number
    feedback: number
    wet: number
  }
  distortion: {
    amount: number
    wet: number
  }
}

export interface MasterParams {
  volume: number
  attack: number
  release: number
  waveform: WaveformType
  octave: number
}

export interface SynthState {
  master: MasterParams
  effects: EffectParams
  activeNote: string | null
  isPlaying: boolean
}

// LFO Parameters
export interface LFOParams {
  rate: number // 0.1-20 Hz
  depth: number // 0-1
  waveform: LFOWaveform
}

export interface ModulationRouting {
  target: ModulationTarget
  amount: number // -1 to 1
  enabled: boolean
}

// Oscillator Parameters
export interface OscillatorParams {
  waveform: WaveformType
  pulseWidth: number // 0-1 (for square wave)
  subOscLevel: number // 0-1
  subOscOctave: -1 | -2
  noiseLevel: number // 0-1
  noiseType: NoiseType
}

// Glide/Portamento
export interface GlideParams {
  enabled: boolean
  time: number // 0-2 seconds
}

// Pitch Bend
export interface PitchBendParams {
  value: number // -1 to 1
  range: number // semitones (default 2)
}

// Filter Envelope
export interface FilterEnvelopeParams {
  attack: number
  decay: number
  sustain: number
  release: number
  amount: number // 0-1 envelope modulation depth
}

// Additional Effects
export interface ChorusParams {
  rate: number // 0.1-10 Hz
  depth: number // 0-1
  wet: number // 0-1
}

export interface PhaserParams {
  rate: number // 0.1-10 Hz
  depth: number // 0-1
  wet: number // 0-1
}

// Arpeggiator
export interface ArpeggiatorParams {
  enabled: boolean
  pattern: ArpPattern
  rate: ArpRate
  octaves: 1 | 2 | 3
}

// Tempo
export interface TempoParams {
  bpm: number // 40-240
  sync: boolean // sync delay/arp to tempo
}

// Preset System
export interface Preset {
  id: string
  name: string
  category: PresetCategory
  params: SynthPresetParams
}

export interface SynthPresetParams {
  master: MasterParams
  effects: EffectParams
  oscillator: OscillatorParams
  lfo: LFOParams
  modRouting: ModulationRouting[]
  glide: GlideParams
  filterEnvelope: FilterEnvelopeParams
  chorus: ChorusParams
  phaser: PhaserParams
  arpeggiator: ArpeggiatorParams
  tempo: TempoParams
}

export const DEFAULT_MASTER_PARAMS: MasterParams = {
  volume: -12,
  attack: 0.01,
  release: 0.3,
  waveform: 'sawtooth',
  octave: 3,
}

export const DEFAULT_EFFECT_PARAMS: EffectParams = {
  lowpass: {
    frequency: 20000,
    Q: 1,
  },
  highpass: {
    frequency: 20,
    Q: 1,
  },
  reverb: {
    decay: 1.5,
    wet: 0,
  },
  delay: {
    time: 0.25,
    feedback: 0.3,
    wet: 0,
  },
  distortion: {
    amount: 0,
    wet: 0.5,
  },
}

export const DEFAULT_LFO_PARAMS: LFOParams = {
  rate: 2,
  depth: 0,
  waveform: 'sine',
}

export const DEFAULT_MOD_ROUTING: ModulationRouting[] = [
  { target: 'filterCutoff', amount: 0, enabled: false },
  { target: 'pitch', amount: 0, enabled: false },
  { target: 'pulseWidth', amount: 0, enabled: false },
]

export const DEFAULT_OSCILLATOR_PARAMS: OscillatorParams = {
  waveform: 'sawtooth',
  pulseWidth: 0.5,
  subOscLevel: 0,
  subOscOctave: -1,
  noiseLevel: 0,
  noiseType: 'white',
}

export const DEFAULT_GLIDE_PARAMS: GlideParams = {
  enabled: false,
  time: 0.1,
}

export const DEFAULT_PITCH_BEND_PARAMS: PitchBendParams = {
  value: 0,
  range: 2,
}

export const DEFAULT_FILTER_ENVELOPE_PARAMS: FilterEnvelopeParams = {
  attack: 0.01,
  decay: 0.2,
  sustain: 0.5,
  release: 0.3,
  amount: 0,
}

export const DEFAULT_CHORUS_PARAMS: ChorusParams = {
  rate: 1.5,
  depth: 0.5,
  wet: 0,
}

export const DEFAULT_PHASER_PARAMS: PhaserParams = {
  rate: 0.5,
  depth: 0.5,
  wet: 0,
}

export const DEFAULT_ARPEGGIATOR_PARAMS: ArpeggiatorParams = {
  enabled: false,
  pattern: 'up',
  rate: '1/8',
  octaves: 1,
}

export const DEFAULT_TEMPO_PARAMS: TempoParams = {
  bpm: 120,
  sync: true,
}
