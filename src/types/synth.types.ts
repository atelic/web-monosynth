export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth'

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
