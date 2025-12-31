import { ToggleButton, SegmentedSelector } from '../Controls'
import { ArpPattern, ArpRate, ArpeggiatorParams } from '../../types/synth.types'

interface ArpeggiatorModuleProps {
  params: ArpeggiatorParams
  onEnabledChange: (enabled: boolean) => void
  onPatternChange: (pattern: ArpPattern) => void
  onRateChange: (rate: ArpRate) => void
  onOctavesChange: (octaves: 1 | 2 | 3) => void
}

const PATTERN_OPTIONS: { value: ArpPattern; label: string }[] = [
  { value: 'up', label: 'UP' },
  { value: 'down', label: 'DN' },
  { value: 'upDown', label: 'U/D' },
  { value: 'random', label: 'RND' },
]

const RATE_OPTIONS: { value: ArpRate; label: string }[] = [
  { value: '1/4', label: '1/4' },
  { value: '1/8', label: '1/8' },
  { value: '1/16', label: '1/16' },
  { value: '1/32', label: '1/32' },
]

const OCTAVE_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
]

export function ArpeggiatorModule({
  params,
  onEnabledChange,
  onPatternChange,
  onRateChange,
  onOctavesChange,
}: ArpeggiatorModuleProps) {
  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Arpeggiator
      </h3>

      <div className="space-y-4">
        {/* On/Off toggle */}
        <div className="flex justify-center">
          <ToggleButton label="Active" value={params.enabled} onChange={onEnabledChange} />
        </div>

        {/* Pattern */}
        <div className="flex justify-center">
          <SegmentedSelector
            label="Pattern"
            value={params.pattern}
            options={PATTERN_OPTIONS}
            onChange={onPatternChange}
            size="sm"
          />
        </div>

        {/* Rate */}
        <div className="flex justify-center">
          <SegmentedSelector
            label="Rate"
            value={params.rate}
            options={RATE_OPTIONS}
            onChange={onRateChange}
            size="sm"
          />
        </div>

        {/* Octaves */}
        <div className="flex justify-center">
          <SegmentedSelector
            label="Octaves"
            value={params.octaves}
            options={OCTAVE_OPTIONS}
            onChange={onOctavesChange}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
