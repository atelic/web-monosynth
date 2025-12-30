import { ModulePanel } from '../Layout/ModulePanel'
import { Knob } from '../Controls'

interface DistortionModuleProps {
  amount: number
  wet: number
  onAmountChange: (value: number) => void
  onWetChange: (value: number) => void
  className?: string
}

export function DistortionModule({
  amount,
  wet,
  onAmountChange,
  onWetChange,
  className = '',
}: DistortionModuleProps) {
  return (
    <ModulePanel title="Distortion" className={className}>
      <Knob
        value={amount}
        min={0}
        max={1}
        onChange={onAmountChange}
        label="Drive"
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
