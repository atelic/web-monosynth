import { ModulePanel } from '../Layout/ModulePanel'
import { Knob, WaveformSelector, OctaveDisplay, ToggleButton } from '../Controls'
import { WaveformType } from '../../types/synth.types'

interface MasterModuleProps {
  volume: number
  attack: number
  release: number
  waveform: WaveformType
  octave: number
  mono: boolean
  onVolumeChange: (value: number) => void
  onAttackChange: (value: number) => void
  onReleaseChange: (value: number) => void
  onWaveformChange: (waveform: WaveformType) => void
  onOctaveChange: (octave: number) => void
  onMonoChange: (mono: boolean) => void
  className?: string
}

export function MasterModule({
  volume,
  attack,
  release,
  waveform,
  octave,
  mono,
  onVolumeChange,
  onAttackChange,
  onReleaseChange,
  onWaveformChange,
  onOctaveChange,
  onMonoChange,
  className = '',
}: MasterModuleProps) {
  return (
    <ModulePanel title="Master" className={className}>
      <Knob
        value={volume}
        min={-60}
        max={0}
        onChange={onVolumeChange}
        label="Volume"
        unit="dB"
        displayValue={(v) => v.toFixed(0)}
      />
      <Knob
        value={attack}
        min={0.001}
        max={2}
        onChange={onAttackChange}
        label="Attack"
        unit="s"
        displayValue={(v) => v.toFixed(2)}
      />
      <Knob
        value={release}
        min={0.01}
        max={2}
        onChange={onReleaseChange}
        label="Release"
        unit="s"
        displayValue={(v) => v.toFixed(2)}
      />
      <WaveformSelector value={waveform} onChange={onWaveformChange} />
      <OctaveDisplay octave={octave} onOctaveChange={onOctaveChange} />
      <ToggleButton label="Mono" value={mono} onChange={onMonoChange} size="sm" />
    </ModulePanel>
  )
}
