import { memo } from 'react'
import { Knob, WaveformSelector, SegmentedSelector } from '../Controls'
import { WaveformType, NoiseType, OscillatorParams, DEFAULT_OSCILLATOR_PARAMS } from '../../types/synth.types'

interface OscillatorModuleProps {
  params: OscillatorParams
  onWaveformChange: (waveform: WaveformType) => void
  onSubOscLevelChange: (level: number) => void
  onSubOscOctaveChange: (octave: -1 | -2) => void
  onNoiseLevelChange: (level: number) => void
  onNoiseTypeChange: (type: NoiseType) => void
}

export const OscillatorModule = memo(function OscillatorModule({
  params,
  onWaveformChange,
  onSubOscLevelChange,
  onSubOscOctaveChange,
  onNoiseLevelChange,
  onNoiseTypeChange,
}: OscillatorModuleProps) {
  return (
    <div className="bg-ableton-surface rounded-lg p-4">
      <h3 className="text-xs font-semibold text-ableton-text-secondary uppercase tracking-wider mb-4">
        Oscillator
      </h3>

      <div className="space-y-4">
        {/* Waveform selector */}
        <div className="flex justify-center">
          <WaveformSelector value={params.waveform} onChange={onWaveformChange} />
        </div>

        {/* Sub Oscillator */}
        <div className="border-t border-ableton-bg pt-4">
          <div className="text-xs text-ableton-text-secondary mb-2 text-center">Sub Osc</div>
          <div className="flex items-center justify-center gap-4">
            <Knob
              label="Level"
              value={params.subOscLevel}
              min={0}
              max={1}
              onChange={onSubOscLevelChange}
              size="sm"
              defaultValue={DEFAULT_OSCILLATOR_PARAMS.subOscLevel}
            />
            <SegmentedSelector
              label="Octave"
              value={params.subOscOctave}
              options={[
                { value: -1 as const, label: '-1' },
                { value: -2 as const, label: '-2' },
              ]}
              onChange={onSubOscOctaveChange}
              size="sm"
            />
          </div>
        </div>

        {/* Noise */}
        <div className="border-t border-ableton-bg pt-4">
          <div className="text-xs text-ableton-text-secondary mb-2 text-center">Noise</div>
          <div className="flex items-center justify-center gap-4">
            <Knob
              label="Level"
              value={params.noiseLevel}
              min={0}
              max={1}
              onChange={onNoiseLevelChange}
              size="sm"
              defaultValue={DEFAULT_OSCILLATOR_PARAMS.noiseLevel}
            />
            <SegmentedSelector
              label="Type"
              value={params.noiseType}
              options={[
                { value: 'white' as NoiseType, label: 'WHT' },
                { value: 'pink' as NoiseType, label: 'PNK' },
              ]}
              onChange={onNoiseTypeChange}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
})
