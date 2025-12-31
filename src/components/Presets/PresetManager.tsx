import { useState, useCallback } from 'react'
import { Preset, PresetCategory, SynthPresetParams } from '../../types/synth.types'
import { PresetModal } from './PresetModal'

interface PresetManagerProps {
  presets: Preset[]
  currentPresetId: string | null
  onLoadPreset: (id: string) => SynthPresetParams | null
  onSavePreset: (name: string, category: PresetCategory, params: SynthPresetParams) => void
  onDeletePreset: (id: string) => boolean
  onInitPreset: () => SynthPresetParams
  onReset: () => void
  getCurrentParams: () => SynthPresetParams
  isUserPreset: (id: string) => boolean
}

const CATEGORIES: { value: PresetCategory; label: string }[] = [
  { value: 'bass', label: 'Bass' },
  { value: 'lead', label: 'Lead' },
  { value: 'pad', label: 'Pad' },
  { value: 'fx', label: 'FX' },
  { value: 'user', label: 'User' },
]

export function PresetManager({
  presets,
  currentPresetId,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  onInitPreset,
  onReset,
  getCurrentParams,
  isUserPreset,
}: PresetManagerProps) {
  const [activeCategory, setActiveCategory] = useState<PresetCategory | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const filteredPresets =
    activeCategory === 'all'
      ? presets
      : presets.filter((p) => p.category === activeCategory)

  const currentPreset = currentPresetId
    ? presets.find((p) => p.id === currentPresetId)
    : null

  const handlePresetSelect = useCallback(
    (id: string) => {
      onLoadPreset(id)
      setIsDropdownOpen(false)
    },
    [onLoadPreset]
  )

  const handleSave = useCallback(
    (name: string, category: PresetCategory) => {
      const params = getCurrentParams()
      onSavePreset(name, category, params)
      setIsModalOpen(false)
    },
    [getCurrentParams, onSavePreset]
  )

  const handleDelete = useCallback(() => {
    if (currentPresetId && isUserPreset(currentPresetId)) {
      if (confirm('Delete this preset?')) {
        onDeletePreset(currentPresetId)
      }
    }
  }, [currentPresetId, isUserPreset, onDeletePreset])

  const handleInit = useCallback(() => {
    onInitPreset()
  }, [onInitPreset])

  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Presets
      </h3>

      <div className="space-y-3">
        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            className={`px-2 py-1 text-xs rounded transition-colors ${
              activeCategory === 'all'
                ? 'bg-ableton-orange text-ableton-bg'
                : 'bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-surface-light'
            }`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeCategory === cat.value
                  ? 'bg-ableton-orange text-ableton-bg'
                  : 'bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-surface-light'
              }`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset selector */}
        <div className="relative">
          <button
            className="w-full px-3 py-2 bg-ableton-bg rounded text-left text-sm text-ableton-text flex justify-between items-center hover:bg-ableton-surface-light transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="truncate">
              {currentPreset ? currentPreset.name : '-- Select Preset --'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-ableton-bg rounded shadow-lg max-h-48 overflow-y-auto">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-ableton-surface-light transition-colors ${
                    preset.id === currentPresetId
                      ? 'text-ableton-orange'
                      : 'text-ableton-text'
                  }`}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <span className="truncate block">{preset.name}</span>
                  <span className="text-xs text-ableton-text-secondary capitalize">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-orange hover:text-ableton-bg rounded transition-colors"
            onClick={handleInit}
          >
            Init
          </button>
          <button
            className="flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-orange hover:text-ableton-bg rounded transition-colors"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            className="flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wide bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-orange hover:text-ableton-bg rounded transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Save
          </button>
          {currentPresetId && isUserPreset(currentPresetId) && (
            <button
              className="px-3 py-2 text-xs font-medium uppercase tracking-wide bg-red-900/50 text-red-400 hover:bg-red-900 rounded transition-colors"
              onClick={handleDelete}
            >
              Del
            </button>
          )}
        </div>
      </div>

      {/* Save modal */}
      {isModalOpen && (
        <PresetModal
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          initialName={currentPreset?.name || ''}
          initialCategory={currentPreset?.category || 'user'}
        />
      )}
    </div>
  )
}
