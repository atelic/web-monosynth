import { useState } from 'react'
import { PresetCategory } from '../../types/synth.types'

interface PresetModalProps {
  onSave: (name: string, category: PresetCategory) => void
  onCancel: () => void
  initialName?: string
  initialCategory?: PresetCategory
}

const CATEGORIES: { value: PresetCategory; label: string }[] = [
  { value: 'bass', label: 'Bass' },
  { value: 'lead', label: 'Lead' },
  { value: 'pad', label: 'Pad' },
  { value: 'fx', label: 'FX' },
  { value: 'user', label: 'User' },
]

export function PresetModal({
  onSave,
  onCancel,
  initialName = '',
  initialCategory = 'user',
}: PresetModalProps) {
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState<PresetCategory>(initialCategory)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), category)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12120f]/80 p-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className="w-80 border border-ableton-border-light bg-ableton-surface p-6 shadow-module"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-preset-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="brand-model">PATCH MEMORY</p>
        <h2 id="save-preset-title" className="mb-5 mt-2 text-lg font-semibold text-ableton-text">
          Store preset
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs text-ableton-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ableton-border bg-ableton-bg px-3 py-2 text-sm text-ableton-text focus:outline-none"
              placeholder="My Preset"
              autoFocus
            />
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-xs text-ableton-text-secondary mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    category === cat.value
                      ? 'bg-ableton-orange text-ableton-bg'
                      : 'bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-surface-light'
                  }`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm bg-ableton-bg text-ableton-text-secondary hover:bg-ableton-surface-light rounded transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 text-sm bg-ableton-orange text-ableton-bg hover:bg-ableton-orange/80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
