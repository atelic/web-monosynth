import { memo } from 'react'
import { Knob } from '../Controls'
import { DEFAULT_TEMPO_PARAMS } from '../../types/synth.types'

interface TempoModuleProps {
  bpm: number
  isPlaying: boolean
  onBpmChange: (bpm: number) => void
  onTapTempo: () => void
  onToggleTransport: () => void
}

export const TempoModule = memo(function TempoModule({
  bpm,
  isPlaying,
  onBpmChange,
  onTapTempo,
  onToggleTransport,
}: TempoModuleProps) {
  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Tempo
      </h3>

      <div className="space-y-4">
        {/* BPM Display and Control */}
        <div className="flex justify-center">
          <Knob
            label="BPM"
            value={bpm}
            min={40}
            max={240}
            onChange={onBpmChange}
            size="md"
            displayValue={(v: number) => `${Math.round(v)}`}
            defaultValue={DEFAULT_TEMPO_PARAMS.bpm}
          />
        </div>

        {/* Transport and Tap */}
        <div className="flex items-center justify-center gap-3">
          <button
            className={`
              px-3 py-2 rounded text-xs font-medium uppercase tracking-wide transition-all
              ${
                isPlaying
                  ? 'bg-green-600 text-white'
                  : 'bg-ableton-surface-light text-ableton-text-secondary hover:bg-ableton-orange hover:text-ableton-bg'
              }
            `}
            onClick={onToggleTransport}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button
            className="px-3 py-2 rounded text-xs font-medium uppercase tracking-wide bg-ableton-surface-light text-ableton-text-secondary hover:bg-ableton-orange hover:text-ableton-bg transition-all"
            onClick={onTapTempo}
          >
            Tap
          </button>
        </div>
      </div>
    </div>
  )
})
