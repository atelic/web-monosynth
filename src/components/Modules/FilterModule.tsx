import { memo } from 'react'
import { ModulePanel } from '../Layout/ModulePanel'
import { Knob } from '../Controls'
import {
  FilterEnvelopeParams,
  DEFAULT_EFFECT_PARAMS,
  DEFAULT_FILTER_ENVELOPE_PARAMS,
} from '../../types/synth.types'

interface FilterModuleProps {
  lowpassFreq: number
  lowpassQ: number
  highpassFreq: number
  highpassQ: number
  filterEnvelope: FilterEnvelopeParams
  onLowpassFreqChange: (value: number) => void
  onLowpassQChange: (value: number) => void
  onHighpassFreqChange: (value: number) => void
  onHighpassQChange: (value: number) => void
  onFilterEnvAttackChange: (value: number) => void
  onFilterEnvDecayChange: (value: number) => void
  onFilterEnvSustainChange: (value: number) => void
  onFilterEnvReleaseChange: (value: number) => void
  onFilterEnvAmountChange: (value: number) => void
  className?: string
}

function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(1)}k`
  }
  return freq.toFixed(0)
}

function formatTime(time: number): string {
  if (time >= 1) {
    return `${time.toFixed(1)}s`
  }
  return `${(time * 1000).toFixed(0)}ms`
}

export const FilterModule = memo(function FilterModule({
  lowpassFreq,
  lowpassQ,
  highpassFreq,
  highpassQ,
  filterEnvelope,
  onLowpassFreqChange,
  onLowpassQChange,
  onHighpassFreqChange,
  onHighpassQChange,
  onFilterEnvAttackChange,
  onFilterEnvDecayChange,
  onFilterEnvSustainChange,
  onFilterEnvReleaseChange,
  onFilterEnvAmountChange,
  className = '',
}: FilterModuleProps) {
  return (
    <ModulePanel title="Filter" className={className}>
      <div className="flex flex-col gap-4">
        {/* Filter cutoff and resonance */}
        <div className="flex gap-3">
          <Knob
            value={lowpassFreq}
            min={20}
            max={20000}
            onChange={onLowpassFreqChange}
            label="LP Freq"
            unit="Hz"
            size="sm"
            displayValue={formatFrequency}
            defaultValue={DEFAULT_EFFECT_PARAMS.lowpass.frequency}
          />
          <Knob
            value={lowpassQ}
            min={0.1}
            max={15}
            onChange={onLowpassQChange}
            label="LP Res"
            size="sm"
            displayValue={(v) => v.toFixed(1)}
            defaultValue={DEFAULT_EFFECT_PARAMS.lowpass.Q}
          />
        </div>
        <div className="flex gap-3">
          <Knob
            value={highpassFreq}
            min={20}
            max={5000}
            onChange={onHighpassFreqChange}
            label="HP Freq"
            unit="Hz"
            size="sm"
            displayValue={formatFrequency}
            defaultValue={DEFAULT_EFFECT_PARAMS.highpass.frequency}
          />
          <Knob
            value={highpassQ}
            min={0.1}
            max={15}
            onChange={onHighpassQChange}
            label="HP Res"
            size="sm"
            displayValue={(v) => v.toFixed(1)}
            defaultValue={DEFAULT_EFFECT_PARAMS.highpass.Q}
          />
        </div>

        {/* Filter Envelope */}
        <div className="border-t border-ableton-bg pt-3">
          <div className="text-xs text-ableton-text-secondary mb-2 text-center">Filter Envelope</div>
          <div className="grid grid-cols-5 gap-2">
            <Knob
              value={filterEnvelope.attack}
              min={0.001}
              max={2}
              onChange={onFilterEnvAttackChange}
              label="A"
              size="sm"
              displayValue={formatTime}
              defaultValue={DEFAULT_FILTER_ENVELOPE_PARAMS.attack}
            />
            <Knob
              value={filterEnvelope.decay}
              min={0.001}
              max={2}
              onChange={onFilterEnvDecayChange}
              label="D"
              size="sm"
              displayValue={formatTime}
              defaultValue={DEFAULT_FILTER_ENVELOPE_PARAMS.decay}
            />
            <Knob
              value={filterEnvelope.sustain}
              min={0}
              max={1}
              onChange={onFilterEnvSustainChange}
              label="S"
              size="sm"
              displayValue={(v) => `${(v * 100).toFixed(0)}%`}
              defaultValue={DEFAULT_FILTER_ENVELOPE_PARAMS.sustain}
            />
            <Knob
              value={filterEnvelope.release}
              min={0.001}
              max={3}
              onChange={onFilterEnvReleaseChange}
              label="R"
              size="sm"
              displayValue={formatTime}
              defaultValue={DEFAULT_FILTER_ENVELOPE_PARAMS.release}
            />
            <Knob
              value={filterEnvelope.amount}
              min={0}
              max={1}
              onChange={onFilterEnvAmountChange}
              label="Amt"
              size="sm"
              displayValue={(v) => `${(v * 100).toFixed(0)}%`}
              defaultValue={DEFAULT_FILTER_ENVELOPE_PARAMS.amount}
            />
          </div>
        </div>
      </div>
    </ModulePanel>
  )
})
