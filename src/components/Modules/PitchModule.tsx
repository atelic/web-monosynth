import { memo } from 'react'
import { Knob, ToggleButton, PitchWheel } from '../Controls'
import { GlideParams, DEFAULT_GLIDE_PARAMS, DEFAULT_PITCH_BEND_RANGE } from '../../types/synth.types'

interface PitchModuleProps {
  glideParams: GlideParams
  pitchBendValue: number
  pitchBendRange: number
  onGlideEnabledChange: (enabled: boolean) => void
  onGlideTimeChange: (time: number) => void
  onPitchBendChange: (value: number) => void
  onPitchBendRangeChange: (range: number) => void
}

export const PitchModule = memo(function PitchModule({
  glideParams,
  pitchBendValue,
  pitchBendRange,
  onGlideEnabledChange,
  onGlideTimeChange,
  onPitchBendChange,
  onPitchBendRangeChange,
}: PitchModuleProps) {
  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Pitch
      </h3>

      <div className="flex items-start justify-center gap-6">
        {/* Pitch Bend Wheel */}
        <div className="flex flex-col items-center gap-2">
          <PitchWheel
            value={pitchBendValue}
            onChange={onPitchBendChange}
            label="BEND"
            height={100}
            springBack={true}
          />
          <Knob
            label="Range"
            value={pitchBendRange}
            min={1}
            max={12}
            onChange={onPitchBendRangeChange}
            size="sm"
            displayValue={(v: number) => `${Math.round(v)} st`}
            defaultValue={DEFAULT_PITCH_BEND_RANGE}
          />
        </div>

        {/* Glide/Portamento */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-ableton-text-secondary">Glide</div>
          <ToggleButton
            label=""
            value={glideParams.enabled}
            onChange={onGlideEnabledChange}
            size="sm"
          />
          <Knob
            label="Time"
            value={glideParams.time}
            min={0.01}
            max={2}
            onChange={onGlideTimeChange}
            size="sm"
            displayValue={(v: number) => `${(v * 1000).toFixed(0)}ms`}
            defaultValue={DEFAULT_GLIDE_PARAMS.time}
          />
        </div>
      </div>
    </div>
  )
})
