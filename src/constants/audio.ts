/**
 * Audio engine constants
 * Extracted from various files to centralize magic numbers
 */

export const AUDIO_CONSTANTS = {
  // Voice configuration
  POLY_VOICE_COUNT: 4,

  // Filter modulation ranges (Hz)
  FILTER_ENV_MAX_SWEEP_HZ: 8000,
  LFO_FILTER_MAX_RANGE_HZ: 5000,

  // UI control sensitivity
  KNOB_DRAG_SENSITIVITY_PX: 150,

  // Filter frequency bounds for UI
  LOWPASS_MAX_FREQ_HZ: 20000,
  HIGHPASS_MAX_FREQ_HZ: 5000,

  // Ramp times for smooth transitions (seconds)
  DEFAULT_RAMP_TIME: 0.1,
  FAST_RAMP_TIME: 0.05,
} as const

export type AudioConstants = typeof AUDIO_CONSTANTS
