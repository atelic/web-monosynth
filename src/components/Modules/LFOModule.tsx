import { Knob, ToggleButton, SegmentedSelector } from '../Controls'
import { LFOWaveform, LFOParams, ModulationRouting, ModulationTarget } from '../../types/synth.types'

interface LFOModuleProps {
  lfoParams: LFOParams
  modRouting: ModulationRouting[]
  onRateChange: (rate: number) => void
  onDepthChange: (depth: number) => void
  onWaveformChange: (waveform: LFOWaveform) => void
  onRoutingChange: (target: ModulationTarget, amount: number, enabled: boolean) => void
}

const LFO_WAVEFORM_OPTIONS: { value: LFOWaveform; label: string }[] = [
  { value: 'sine', label: 'SIN' },
  { value: 'triangle', label: 'TRI' },
  { value: 'square', label: 'SQR' },
  { value: 'sawtooth', label: 'SAW' },
]

export function LFOModule({
  lfoParams,
  modRouting,
  onRateChange,
  onDepthChange,
  onWaveformChange,
  onRoutingChange,
}: LFOModuleProps) {
  const getRouting = (target: ModulationTarget): ModulationRouting => {
    return modRouting.find((r) => r.target === target) || { target, amount: 0, enabled: false }
  }

  const handleRoutingToggle = (target: ModulationTarget) => {
    const routing = getRouting(target)
    onRoutingChange(target, routing.amount, !routing.enabled)
  }

  const handleRoutingAmountChange = (target: ModulationTarget, amount: number) => {
    const routing = getRouting(target)
    onRoutingChange(target, amount, routing.enabled)
  }

  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        LFO
      </h3>

      <div className="space-y-4">
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
          />
          <Knob
            label="Depth"
            value={lfoParams.depth}
            min={0}
            max={1}
            onChange={onDepthChange}
            size="sm"
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

        {/* Modulation routing - Filter cutoff only */}
        <div className="border-t border-ableton-bg pt-4">
          <div className="text-xs text-ableton-text-secondary mb-3 text-center">Routing</div>
          <div className="flex justify-center">
            {/* Filter Cutoff */}
            <div className="flex flex-col items-center gap-2">
              <ToggleButton
                label=""
                value={getRouting('filterCutoff').enabled}
                onChange={() => handleRoutingToggle('filterCutoff')}
                size="sm"
              />
              <Knob
                label="Filter"
                value={getRouting('filterCutoff').amount}
                min={0}
                max={1}
                onChange={(v) => handleRoutingAmountChange('filterCutoff', v)}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
