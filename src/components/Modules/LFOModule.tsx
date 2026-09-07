import { memo } from 'react'
import { Knob, ToggleButton, SegmentedSelector } from '../Controls'
import {
  LFOWaveform,
  LFOParams,
  ModulationRouting,
  ModulationTarget,
  DEFAULT_LFO_PARAMS,
} from '../../types/synth.types'

interface LFOModuleProps {
  lfoParams: LFOParams
  modRouting: ModulationRouting[]
  onRateChange: (rate: number) => void
  onDepthChange: (depth: number) => void
  onWaveformChange: (waveform: LFOWaveform) => void
  onRoutingChange: (target: ModulationTarget, amount: number, enabled: boolean) => void
  className?: string
}

const LFO_WAVEFORM_OPTIONS: { value: LFOWaveform; label: string }[] = [
  { value: 'sine', label: 'SIN' },
  { value: 'triangle', label: 'TRI' },
  { value: 'square', label: 'SQR' },
  { value: 'sawtooth', label: 'SAW' },
]

export const LFOModule = memo(function LFOModule({
  lfoParams,
  modRouting,
  onRateChange,
  onDepthChange,
  onWaveformChange,
  onRoutingChange,
  className = '',
}: LFOModuleProps) {
  const routing = modRouting.find((route) => route.target === 'filterCutoff')
  const amount = routing?.amount ?? 0
  const enabled = routing?.enabled ?? false

  return (
    <div className={`bg-ableton-surface rounded-lg p-3 ${className}`}>
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        LFO
      </h3>

      <div className="lfo-controls">
        {/* Main LFO controls */}
        <div className="flex items-center justify-center gap-4">
          <Knob
            label="Rate"
            value={lfoParams.rate}
            min={0.1}
            max={20}
            onChange={onRateChange}
            size="sm"
            displayValue={(v: number) => `${v.toFixed(1)} Hz`}
            defaultValue={DEFAULT_LFO_PARAMS.rate}
          />
          <Knob
            label="Depth"
            value={lfoParams.depth}
            min={0}
            max={1}
            onChange={onDepthChange}
            size="sm"
            defaultValue={DEFAULT_LFO_PARAMS.depth}
          />
          <Knob
            label="Amount"
            value={amount}
            min={0}
            max={1}
            onChange={(value) => onRoutingChange('filterCutoff', value, enabled)}
            size="sm"
            defaultValue={0}
          />
        </div>

        {/* Waveform selector */}
        <div className="flex justify-center">
          <SegmentedSelector
            label="Waveform"
            value={lfoParams.waveform}
            options={LFO_WAVEFORM_OPTIONS}
            onChange={onWaveformChange}
            size="sm"
          />
        </div>

        <div className="flex justify-center">
          <ToggleButton
            label="To filter"
            value={enabled}
            onChange={(value) => onRoutingChange('filterCutoff', amount, value)}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
})
