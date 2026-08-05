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
    <div className="preset-manager rounded-lg border border-ableton-border bg-ableton-surface p-3 shadow-module">
      <div className="preset-manager__header mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <h3 className="module-title mb-0">Presets</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ableton-text-muted">
          {filteredPresets.length} available
        </p>
      </div>

      <div className="preset-manager__body grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] lg:items-start">
        {/* Category tabs */}
        <div className="preset-categories flex gap-1 overflow-x-auto rounded bg-ableton-bg p-1 ring-1 ring-ableton-border-light/70">
          <button
            className={`rounded px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
              activeCategory === 'all'
                ? 'bg-ableton-orange text-ableton-bg'
                : 'text-ableton-text-secondary hover:bg-ableton-surface-light'
            }`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`rounded px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                activeCategory === cat.value
                  ? 'bg-ableton-orange text-ableton-bg'
                  : 'text-ableton-text-secondary hover:bg-ableton-surface-light'
              }`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset selector */}
        <div className="preset-select relative">
          <button
            className="flex w-full items-center justify-between rounded bg-ableton-bg px-3 py-2.5 text-left text-sm text-ableton-text ring-1 ring-ableton-border-light/70 transition-colors hover:bg-ableton-surface-light"
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
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-ableton-border bg-ableton-bg shadow-module">
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
        <div className="preset-actions flex gap-2">
          <button
            className="flex-1 rounded bg-ableton-bg px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ableton-text-secondary transition-colors hover:bg-ableton-orange hover:text-ableton-bg"
            onClick={handleInit}
          >
            Init
          </button>
          <button
            className="flex-1 rounded bg-ableton-bg px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ableton-text-secondary transition-colors hover:bg-ableton-orange hover:text-ableton-bg"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            className="flex-1 rounded bg-ableton-bg px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ableton-text-secondary transition-colors hover:bg-ableton-orange hover:text-ableton-bg"
            onClick={() => setIsModalOpen(true)}
          >
            Save
          </button>
          {currentPresetId && isUserPreset(currentPresetId) && (
            <button
              className="rounded bg-ableton-red/20 px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ableton-red transition-colors hover:bg-ableton-red hover:text-ableton-bg"
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
