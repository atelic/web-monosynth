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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ableton-surface rounded-lg p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold text-ableton-text mb-4">Save Preset</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs text-ableton-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-ableton-bg rounded text-ableton-text text-sm focus:outline-none focus:ring-2 focus:ring-ableton-orange"
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
