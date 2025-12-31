import { useState, useCallback, useEffect } from 'react'
import {
  Preset,
  SynthPresetParams,
  PresetCategory,
  DEFAULT_MASTER_PARAMS,
  DEFAULT_EFFECT_PARAMS,
  DEFAULT_LFO_PARAMS,
  DEFAULT_MOD_ROUTING,
  DEFAULT_OSCILLATOR_PARAMS,
  DEFAULT_GLIDE_PARAMS,
  DEFAULT_FILTER_ENVELOPE_PARAMS,
  DEFAULT_CHORUS_PARAMS,
  DEFAULT_PHASER_PARAMS,
  DEFAULT_ARPEGGIATOR_PARAMS,
  DEFAULT_TEMPO_PARAMS,
  DEFAULT_PITCH_BEND_RANGE,
} from '../types/synth.types'

const STORAGE_KEY = 'web-monosynth-presets'

export const DEFAULT_PRESET_PARAMS: SynthPresetParams = {
  master: DEFAULT_MASTER_PARAMS,
  effects: DEFAULT_EFFECT_PARAMS,
  oscillator: DEFAULT_OSCILLATOR_PARAMS,
  lfo: DEFAULT_LFO_PARAMS,
  modRouting: DEFAULT_MOD_ROUTING,
  glide: DEFAULT_GLIDE_PARAMS,
  filterEnvelope: DEFAULT_FILTER_ENVELOPE_PARAMS,
  chorus: DEFAULT_CHORUS_PARAMS,
  phaser: DEFAULT_PHASER_PARAMS,
  arpeggiator: DEFAULT_ARPEGGIATOR_PARAMS,
  tempo: DEFAULT_TEMPO_PARAMS,
  pitchBendRange: DEFAULT_PITCH_BEND_RANGE,
}

// Factory presets will be imported from constants
import { FACTORY_PRESETS } from '../constants/factoryPresets'

// Migration helper for old presets that might have PWM/sync fields
function migratePresetParams(params: Record<string, unknown>): SynthPresetParams {
  const migrated = { ...DEFAULT_PRESET_PARAMS }
  
  // Safely copy over existing valid fields
  if (params.master && typeof params.master === 'object') {
    const master = params.master as Record<string, unknown>
    migrated.master = {
      volume: typeof master.volume === 'number' ? master.volume : DEFAULT_MASTER_PARAMS.volume,
      attack: typeof master.attack === 'number' ? master.attack : DEFAULT_MASTER_PARAMS.attack,
      release: typeof master.release === 'number' ? master.release : DEFAULT_MASTER_PARAMS.release,
      waveform: master.waveform as typeof DEFAULT_MASTER_PARAMS.waveform || DEFAULT_MASTER_PARAMS.waveform,
      octave: typeof master.octave === 'number' ? master.octave : DEFAULT_MASTER_PARAMS.octave,
      mono: typeof master.mono === 'boolean' ? master.mono : DEFAULT_MASTER_PARAMS.mono,
    }
  }

  if (params.effects && typeof params.effects === 'object') {
    migrated.effects = params.effects as typeof DEFAULT_EFFECT_PARAMS
  }

  if (params.oscillator && typeof params.oscillator === 'object') {
    const osc = params.oscillator as Record<string, unknown>
    migrated.oscillator = {
      waveform: osc.waveform as typeof DEFAULT_OSCILLATOR_PARAMS.waveform || DEFAULT_OSCILLATOR_PARAMS.waveform,
      subOscLevel: typeof osc.subOscLevel === 'number' ? osc.subOscLevel : DEFAULT_OSCILLATOR_PARAMS.subOscLevel,
      subOscOctave: osc.subOscOctave as typeof DEFAULT_OSCILLATOR_PARAMS.subOscOctave || DEFAULT_OSCILLATOR_PARAMS.subOscOctave,
      noiseLevel: typeof osc.noiseLevel === 'number' ? osc.noiseLevel : DEFAULT_OSCILLATOR_PARAMS.noiseLevel,
      noiseType: osc.noiseType as typeof DEFAULT_OSCILLATOR_PARAMS.noiseType || DEFAULT_OSCILLATOR_PARAMS.noiseType,
    }
  }

  if (params.lfo && typeof params.lfo === 'object') {
    migrated.lfo = params.lfo as typeof DEFAULT_LFO_PARAMS
  }

  // Filter out PWM and pitch from modRouting - only filterCutoff is supported now
  if (params.modRouting && Array.isArray(params.modRouting)) {
    const filterCutoffRouting = (params.modRouting as Array<Record<string, unknown>>)
      .find((r) => r.target === 'filterCutoff')
    
    if (filterCutoffRouting) {
      migrated.modRouting = [{
        target: 'filterCutoff' as const,
        amount: typeof filterCutoffRouting.amount === 'number' ? filterCutoffRouting.amount : 0,
        enabled: typeof filterCutoffRouting.enabled === 'boolean' ? filterCutoffRouting.enabled : false,
      }]
    } else {
      migrated.modRouting = [{ target: 'filterCutoff', amount: 0, enabled: false }]
    }
  }

  if (params.glide && typeof params.glide === 'object') {
    migrated.glide = params.glide as typeof DEFAULT_GLIDE_PARAMS
  }

  if (params.filterEnvelope && typeof params.filterEnvelope === 'object') {
    migrated.filterEnvelope = params.filterEnvelope as typeof DEFAULT_FILTER_ENVELOPE_PARAMS
  }

  if (params.chorus && typeof params.chorus === 'object') {
    migrated.chorus = params.chorus as typeof DEFAULT_CHORUS_PARAMS
  }

  if (params.phaser && typeof params.phaser === 'object') {
    migrated.phaser = params.phaser as typeof DEFAULT_PHASER_PARAMS
  }

  if (params.arpeggiator && typeof params.arpeggiator === 'object') {
    migrated.arpeggiator = params.arpeggiator as typeof DEFAULT_ARPEGGIATOR_PARAMS
  }

  // Handle tempo migration (remove sync if present)
  if (params.tempo && typeof params.tempo === 'object') {
    const tempo = params.tempo as Record<string, unknown>
    migrated.tempo = {
      bpm: typeof tempo.bpm === 'number' ? tempo.bpm : DEFAULT_TEMPO_PARAMS.bpm,
    }
  }

  // Add pitchBendRange if missing
  migrated.pitchBendRange = typeof params.pitchBendRange === 'number' 
    ? params.pitchBendRange 
    : DEFAULT_PITCH_BEND_RANGE

  return migrated
}

export function usePresets() {
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null)

  // Load user presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Preset[]
        // Migrate old presets
        const migrated = parsed.map((preset) => ({
          ...preset,
          params: migratePresetParams(preset.params as unknown as Record<string, unknown>),
        }))
        setUserPresets(migrated)
      }
    } catch (e) {
      console.error('Failed to load presets from localStorage:', e)
    }
  }, [])

  // Save user presets to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets))
    } catch (e) {
      console.error('Failed to save presets to localStorage:', e)
    }
  }, [userPresets])

  const allPresets = [...FACTORY_PRESETS, ...userPresets]

  const getPresetsByCategory = useCallback(
    (category: PresetCategory) => {
      return allPresets.filter((p) => p.category === category)
    },
    [allPresets]
  )

  const getPresetById = useCallback(
    (id: string) => {
      return allPresets.find((p) => p.id === id)
    },
    [allPresets]
  )

  const savePreset = useCallback(
    (name: string, category: PresetCategory, params: SynthPresetParams) => {
      const newPreset: Preset = {
        id: `user-${Date.now()}`,
        name,
        category,
        params,
      }
      setUserPresets((prev) => [...prev, newPreset])
      setCurrentPresetId(newPreset.id)
      return newPreset
    },
    []
  )

  const updatePreset = useCallback(
    (id: string, params: Partial<Preset>) => {
      setUserPresets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...params } : p))
      )
    },
    []
  )

  const deletePreset = useCallback((id: string) => {
    // Only allow deleting user presets
    if (!id.startsWith('user-')) return false
    setUserPresets((prev) => prev.filter((p) => p.id !== id))
    setCurrentPresetId(null)
    return true
  }, [])

  const loadPreset = useCallback(
    (id: string): SynthPresetParams | null => {
      const preset = getPresetById(id)
      if (preset) {
        setCurrentPresetId(id)
        return preset.params
      }
      return null
    },
    [getPresetById]
  )

  const initPreset = useCallback(() => {
    setCurrentPresetId(null)
    return DEFAULT_PRESET_PARAMS
  }, [])

  const isUserPreset = useCallback((id: string) => {
    return id.startsWith('user-')
  }, [])

  return {
    presets: allPresets,
    userPresets,
    factoryPresets: FACTORY_PRESETS,
    currentPresetId,
    getPresetsByCategory,
    getPresetById,
    savePreset,
    updatePreset,
    deletePreset,
    loadPreset,
    initPreset,
    isUserPreset,
  }
}
