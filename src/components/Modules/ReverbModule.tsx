import { ModulePanel } from '../Layout/ModulePanel'
import { Knob } from '../Controls'
import { DEFAULT_EFFECT_PARAMS } from '../../types/synth.types'

interface ReverbModuleProps {
  decay: number
  wet: number
  onDecayChange: (value: number) => void
  onWetChange: (value: number) => void
  className?: string
}

export function ReverbModule({
  decay,
  wet,
  onDecayChange,
  onWetChange,
  className = '',
}: ReverbModuleProps) {
  return (
    <ModulePanel title="Reverb" className={className}>
      <Knob
        value={decay}
        min={0.1}
        max={10}
        onChange={onDecayChange}
        label="Decay"
        unit="s"
        displayValue={(v) => v.toFixed(1)}
        defaultValue={DEFAULT_EFFECT_PARAMS.reverb.decay}
      />
      <Knob
        value={wet}
        min={0}
        max={1}
        onChange={onWetChange}
        label="Mix"
        displayValue={(v) => `${Math.round(v * 100)}%`}
        defaultValue={DEFAULT_EFFECT_PARAMS.reverb.wet}
      />
    </ModulePanel>
  )
}
