interface OctaveDisplayProps {
  octave: number
  onOctaveChange: (octave: number) => void
}

export function OctaveDisplay({ octave, onOctaveChange }: OctaveDisplayProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="knob-label">Octave</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOctaveChange(Math.max(0, octave - 1))}
          disabled={octave <= 0}
          className="w-6 h-6 rounded bg-ableton-surface-light text-ableton-text-dim hover:bg-ableton-border hover:text-ableton-text disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-mono"
        >
          -
        </button>
        <span className="w-8 text-center text-lg font-mono text-ableton-text">{octave}</span>
        <button
          onClick={() => onOctaveChange(Math.min(5, octave + 1))}
          disabled={octave >= 5}
          className="w-6 h-6 rounded bg-ableton-surface-light text-ableton-text-dim hover:bg-ableton-border hover:text-ableton-text disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-mono"
        >
          +
        </button>
      </div>
      <span className="text-xs text-ableton-text-muted font-mono">Z/X keys</span>
    </div>
  )
}
