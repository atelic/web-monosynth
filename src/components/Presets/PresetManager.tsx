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

  const filteredPresets =
    activeCategory === 'all' ? presets : presets.filter((p) => p.category === activeCategory)

  const currentPreset = currentPresetId ? presets.find((p) => p.id === currentPresetId) : null

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

  return (
    <div className="preset-manager rounded-lg border border-ableton-border bg-ableton-surface p-3 shadow-module">
      <div className="preset-manager__body grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] lg:items-start">
        {/* Category tabs */}
        <div className="preset-categories flex gap-1 overflow-x-auto rounded bg-ableton-bg p-1 ring-1 ring-ableton-border-light/70">
          <button
            className={`rounded px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
              activeCategory === 'all'
                ? 'bg-ableton-orange text-ableton-bg'
                : 'text-ableton-text-secondary hover:bg-ableton-surface-light'
            }`}
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`rounded px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                activeCategory === cat.value
                  ? 'bg-ableton-orange text-ableton-bg'
                  : 'text-ableton-text-secondary hover:bg-ableton-surface-light'
              }`}
              aria-pressed={activeCategory === cat.value}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Preset"
          className="preset-select w-full border border-ableton-border bg-ableton-bg px-3 py-2 text-sm text-ableton-text"
          value={currentPresetId ?? ''}
          onChange={(event) => onLoadPreset(event.target.value)}
        >
          <option value="" disabled>
            {filteredPresets.length ? 'Choose a preset' : 'No presets in this category'}
          </option>
          {currentPreset && !filteredPresets.includes(currentPreset) && (
            <option value={currentPreset.id} hidden>
              {currentPreset.name}
            </option>
          )}
          {filteredPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>

        {/* Action buttons */}
        <div className="preset-actions flex gap-2">
          <button
            className="flex-1 rounded bg-ableton-bg px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ableton-text-secondary transition-colors hover:bg-ableton-orange hover:text-ableton-bg"
            onClick={onInitPreset}
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
