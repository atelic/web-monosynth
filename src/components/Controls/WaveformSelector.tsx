import { WaveformType } from '../../types/synth.types'

interface WaveformSelectorProps {
  value: WaveformType
  onChange: (waveform: WaveformType) => void
}

const waveforms: { type: WaveformType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'sine',
    label: 'Sine',
    icon: (
      <svg viewBox="0 0 24 12" className="w-6 h-3">
        <path
          d="M0 6 Q6 0 12 6 Q18 12 24 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg viewBox="0 0 24 12" className="w-6 h-3">
        <path d="M0 6 L6 0 L12 6 L18 12 L24 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'sawtooth',
    label: 'Saw',
    icon: (
      <svg viewBox="0 0 24 12" className="w-6 h-3">
        <path d="M0 12 L12 0 L12 12 L24 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'square',
    label: 'Square',
    icon: (
      <svg viewBox="0 0 24 12" className="w-6 h-3">
        <path
          d="M0 12 L0 0 L12 0 L12 12 L24 12 L24 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
]

export function WaveformSelector({ value, onChange }: WaveformSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="knob-label">Waveform</span>
      <div className="flex gap-1 p-1 bg-ableton-bg rounded ring-1 ring-ableton-border">
        {waveforms.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded transition-all ${
              value === type
                ? 'bg-ableton-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-ableton-surface text-ableton-text-muted hover:text-ableton-text-dim hover:bg-ableton-surface-light'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}
