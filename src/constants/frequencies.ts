import { KeyConfig } from '../types/synth.types'

export const KEY_MAPPING: KeyConfig[] = [
  {
    code: 'KeyA',
    noteName: 'C',
    isBlack: false,
    frequencies: {
      0: 16.35,
      1: 32.7,
      2: 65.41,
      3: 130.81,
      4: 261.63,
      5: 523.25,
    },
  },
  {
    code: 'KeyW',
    noteName: 'C#',
    isBlack: true,
    frequencies: {
      0: 17.32,
      1: 34.65,
      2: 69.3,
      3: 138.59,
      4: 277.18,
      5: 554.37,
    },
  },
  {
    code: 'KeyS',
    noteName: 'D',
    isBlack: false,
    frequencies: {
      0: 18.35,
      1: 36.71,
      2: 73.42,
      3: 146.83,
      4: 293.66,
      5: 587.33,
    },
  },
  {
    code: 'KeyE',
    noteName: 'D#',
    isBlack: true,
    frequencies: {
      0: 19.45,
      1: 38.89,
      2: 77.78,
      3: 155.56,
      4: 311.13,
      5: 622.25,
    },
  },
  {
    code: 'KeyD',
    noteName: 'E',
    isBlack: false,
    frequencies: {
      0: 20.6,
      1: 41.2,
      2: 82.41,
      3: 164.81,
      4: 329.63,
      5: 659.26,
    },
  },
  {
    code: 'KeyF',
    noteName: 'F',
    isBlack: false,
    frequencies: {
      0: 21.83,
      1: 43.65,
      2: 87.31,
      3: 174.61,
      4: 349.23,
      5: 698.46,
    },
  },
  {
    code: 'KeyT',
    noteName: 'F#',
    isBlack: true,
    frequencies: {
      0: 23.12,
      1: 46.25,
      2: 92.5,
      3: 185.0,
      4: 369.99,
      5: 739.99,
    },
  },
  {
    code: 'KeyG',
    noteName: 'G',
    isBlack: false,
    frequencies: {
      0: 24.5,
      1: 49.0,
      2: 98.0,
      3: 196.0,
      4: 392.0,
      5: 783.99,
    },
  },
  {
    code: 'KeyY',
    noteName: 'G#',
    isBlack: true,
    frequencies: {
      0: 25.96,
      1: 51.91,
      2: 103.83,
      3: 207.65,
      4: 415.3,
      5: 830.61,
    },
  },
  {
    code: 'KeyH',
    noteName: 'A',
    isBlack: false,
    frequencies: {
      0: 27.5,
      1: 55.0,
      2: 110.0,
      3: 220.0,
      4: 440.0,
      5: 880.0,
    },
  },
  {
    code: 'KeyU',
    noteName: 'A#',
    isBlack: true,
    frequencies: {
      0: 29.14,
      1: 58.27,
      2: 116.54,
      3: 233.08,
      4: 466.16,
      5: 932.33,
    },
  },
  {
    code: 'KeyJ',
    noteName: 'B',
    isBlack: false,
    frequencies: {
      0: 30.87,
      1: 61.74,
      2: 123.47,
      3: 246.94,
      4: 493.88,
      5: 987.77,
    },
  },
  {
    code: 'KeyK',
    noteName: 'C',
    isBlack: false,
    frequencies: {
      0: 32.7,
      1: 65.41,
      2: 130.81,
      3: 261.63,
      4: 523.25,
      5: 1046.5,
    },
  },
  {
    code: 'KeyO',
    noteName: 'C#',
    isBlack: true,
    frequencies: {
      0: 34.65,
      1: 69.3,
      2: 138.59,
      3: 277.18,
      4: 554.37,
      5: 1108.73,
    },
  },
  {
    code: 'KeyL',
    noteName: 'D',
    isBlack: false,
    frequencies: {
      0: 36.71,
      1: 73.42,
      2: 146.83,
      3: 293.66,
      4: 587.33,
      5: 1174.66,
    },
  },
]

export const NOTE_KEY_CODES = new Set(KEY_MAPPING.map((k) => k.code))

export function getKeyConfig(code: string): KeyConfig | undefined {
  return KEY_MAPPING.find((k) => k.code === code)
}

export function getFrequency(code: string, octave: number): number | null {
  const key = getKeyConfig(code)
  return key?.frequencies[octave] ?? null
}
