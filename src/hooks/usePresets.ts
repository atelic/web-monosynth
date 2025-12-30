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
}

// Factory presets will be imported from constants
import { FACTORY_PRESETS } from '../constants/factoryPresets'

export function usePresets() {
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null)

  // Load user presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUserPresets(JSON.parse(stored))
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
