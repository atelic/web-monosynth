import { ModulePanel } from '../Layout/ModulePanel'
import { Knob } from '../Controls'

interface DelayModuleProps {
  time: number
  feedback: number
  wet: number
  onTimeChange: (value: number) => void
  onFeedbackChange: (value: number) => void
  onWetChange: (value: number) => void
  className?: string
}

export function DelayModule({
  time,
  feedback,
  wet,
  onTimeChange,
  onFeedbackChange,
  onWetChange,
  className = '',
}: DelayModuleProps) {
  return (
    <ModulePanel title="Delay" className={className}>
      <Knob
        value={time}
        min={0.01}
        max={1}
        onChange={onTimeChange}
        label="Time"
        unit="s"
        displayValue={(v) => v.toFixed(2)}
      />
      <Knob
        value={feedback}
        min={0}
        max={0.9}
        onChange={onFeedbackChange}
        label="Feedback"
        displayValue={(v) => `${Math.round(v * 100)}%`}
      />
      <Knob
        value={wet}
        min={0}
        max={1}
        onChange={onWetChange}
        label="Mix"
        displayValue={(v) => `${Math.round(v * 100)}%`}
      />
    </ModulePanel>
  )
}
