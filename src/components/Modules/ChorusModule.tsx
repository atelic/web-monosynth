import { memo } from 'react'
import { Knob } from '../Controls'
import { ChorusParams, DEFAULT_CHORUS_PARAMS } from '../../types/synth.types'

interface ChorusModuleProps {
  params: ChorusParams
  onRateChange: (rate: number) => void
  onDepthChange: (depth: number) => void
  onWetChange: (wet: number) => void
}

export const ChorusModule = memo(function ChorusModule({
  params,
  onRateChange,
  onDepthChange,
  onWetChange,
}: ChorusModuleProps) {
  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Chorus
      </h3>

      <div className="flex items-center justify-center gap-3">
        <Knob
          label="Rate"
          value={params.rate}
          min={0.1}
          max={10}
          onChange={onRateChange}
          size="sm"
          displayValue={(v: number) => `${v.toFixed(1)} Hz`}
          defaultValue={DEFAULT_CHORUS_PARAMS.rate}
        />
        <Knob
          label="Depth"
          value={params.depth}
          min={0}
          max={1}
          onChange={onDepthChange}
          size="sm"
          defaultValue={DEFAULT_CHORUS_PARAMS.depth}
        />
        <Knob
          label="Mix"
          value={params.wet}
          min={0}
          max={1}
          onChange={onWetChange}
          size="sm"
          defaultValue={DEFAULT_CHORUS_PARAMS.wet}
        />
      </div>
    </div>
  )
})
