import { ModulePanel } from '../Layout/ModulePanel'
import { Knob } from '../Controls'

interface FilterModuleProps {
  lowpassFreq: number
  lowpassQ: number
  highpassFreq: number
  highpassQ: number
  onLowpassFreqChange: (value: number) => void
  onLowpassQChange: (value: number) => void
  onHighpassFreqChange: (value: number) => void
  onHighpassQChange: (value: number) => void
  className?: string
}

function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(1)}k`
  }
  return freq.toFixed(0)
}

export function FilterModule({
  lowpassFreq,
  lowpassQ,
  highpassFreq,
  highpassQ,
  onLowpassFreqChange,
  onLowpassQChange,
  onHighpassFreqChange,
  onHighpassQChange,
  className = '',
}: FilterModuleProps) {
  return (
    <ModulePanel title="Filters" className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Knob
            value={lowpassFreq}
            min={100}
            max={20000}
            onChange={onLowpassFreqChange}
            label="LP Freq"
            unit="Hz"
            size="sm"
            displayValue={formatFrequency}
          />
          <Knob
            value={lowpassQ}
            min={0.1}
            max={15}
            onChange={onLowpassQChange}
            label="LP Res"
            size="sm"
            displayValue={(v) => v.toFixed(1)}
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
          />
          <Knob
            value={highpassQ}
            min={0.1}
            max={15}
            onChange={onHighpassQChange}
            label="HP Res"
            size="sm"
            displayValue={(v) => v.toFixed(1)}
          />
        </div>
      </div>
    </ModulePanel>
  )
}
