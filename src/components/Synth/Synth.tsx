import { useSynth } from '../../context'
import { useKeyboard } from '../../hooks/useKeyboard'
import { VisualizerErrorBoundary } from '../ErrorBoundary'
import { Keyboard } from '../Keyboard'
import {
  MasterModule,
  FilterModule,
  ReverbModule,
  DelayModule,
  DistortionModule,
  OscillatorModule,
  LFOModule,
  PitchModule,
  ChorusModule,
  PhaserModule,
  TempoModule,
  ArpeggiatorModule,
} from '../Modules'
import { VUMeter, WaveformDisplay, SpectrumAnalyzer } from '../Visualizers'
import { PresetManager } from '../Presets'

function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-ableton-bg flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-ableton-text">Web PolySynth</h1>
      <p className="text-ableton-text-dim max-w-md text-center">
        A 4-voice polyphonic synthesizer with LFO, sub-oscillator, filter envelope,
        chorus, phaser, delay, reverb, and arpeggiator - right in your browser.
        <br />
        Use your keyboard or click the keys to play chords.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-ableton-accent text-white rounded-lg text-xl font-semibold hover:bg-ableton-accent-hover transition-colors shadow-lg"
      >
        Click to Start
      </button>
      <p className="text-ableton-text-muted text-sm">
        Audio requires user interaction to start
      </p>
    </div>
  )
}

function SynthUI() {
  const synth = useSynth()

  useKeyboard({
    onNoteOn: synth.handleNoteOn,
    onNoteOff: synth.handleNoteOff,
    onOctaveChange: synth.handleOctaveChange,
    enabled: synth.isInitialized,
  })

  return (
    <div className="min-h-screen bg-ableton-bg p-3 md:p-4">
      <header className="mb-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-ableton-text">Web PolySynth</h1>
          <p className="text-xs text-ableton-text-dim">4-voice polyphonic</p>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <VisualizerErrorBoundary name="Waveform">
            <WaveformDisplay
              className="flex-1 min-w-0"
              getWaveformData={synth.getWaveformData}
              isPlaying={synth.isPlaying}
              compact
            />
          </VisualizerErrorBoundary>
          <VisualizerErrorBoundary name="Spectrum">
            <SpectrumAnalyzer
              getFFTData={synth.getFFTData}
              isActive={synth.isInitialized}
              compact
              className="w-32 flex-shrink-0"
            />
          </VisualizerErrorBoundary>
          <VisualizerErrorBoundary name="VU Meter">
            <VUMeter
              getMeterLevel={synth.getMeterLevel}
              isPlaying={synth.isPlaying}
              compact
              className="w-32 flex-shrink-0"
            />
          </VisualizerErrorBoundary>
        </div>
      </header>

      <div className="mb-3">
        <Keyboard
          activeKeys={synth.activeKeys}
          onNoteOn={synth.handleNoteOn}
          onNoteOff={synth.handleNoteOff}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MasterModule
          volume={synth.params.master.volume}
          attack={synth.params.master.attack}
          release={synth.params.master.release}
          waveform={synth.params.master.waveform}
          octave={synth.params.master.octave}
          mono={synth.params.master.mono}
          onVolumeChange={synth.setVolume}
          onAttackChange={synth.setAttack}
          onReleaseChange={synth.setRelease}
          onWaveformChange={synth.setWaveform}
          onOctaveChange={synth.setOctave}
          onMonoChange={synth.setMonoMode}
        />

        <OscillatorModule
          params={synth.params.oscillator}
          onWaveformChange={synth.setWaveform}
          onSubOscLevelChange={synth.setSubOscLevel}
          onSubOscOctaveChange={synth.setSubOscOctave}
          onNoiseLevelChange={synth.setNoiseLevel}
          onNoiseTypeChange={synth.setNoiseType}
        />

        <PitchModule
          glideParams={synth.params.glide}
          pitchBendValue={synth.pitchBendValue}
          pitchBendRange={synth.params.pitchBendRange}
          onGlideEnabledChange={synth.setGlideEnabled}
          onGlideTimeChange={synth.setGlideTime}
          onPitchBendChange={synth.setPitchBend}
          onPitchBendRangeChange={synth.setPitchBendRange}
        />

        <FilterModule
          lowpassFreq={synth.params.effects.lowpass.frequency}
          lowpassQ={synth.params.effects.lowpass.Q}
          highpassFreq={synth.params.effects.highpass.frequency}
          highpassQ={synth.params.effects.highpass.Q}
          filterEnvelope={synth.params.filterEnvelope}
          onLowpassFreqChange={synth.setLowpassFrequency}
          onLowpassQChange={synth.setLowpassQ}
          onHighpassFreqChange={synth.setHighpassFrequency}
          onHighpassQChange={synth.setHighpassQ}
          onFilterEnvAttackChange={synth.setFilterEnvAttack}
          onFilterEnvDecayChange={synth.setFilterEnvDecay}
          onFilterEnvSustainChange={synth.setFilterEnvSustain}
          onFilterEnvReleaseChange={synth.setFilterEnvRelease}
          onFilterEnvAmountChange={synth.setFilterEnvAmount}
        />

        <LFOModule
          lfoParams={synth.params.lfo}
          modRouting={synth.params.modRouting}
          onRateChange={synth.setLFORate}
          onDepthChange={synth.setLFODepth}
          onWaveformChange={synth.setLFOWaveform}
          onRoutingChange={synth.setModRouting}
        />

        <TempoModule
          bpm={synth.tempo.bpm}
          isPlaying={synth.tempo.isPlaying}
          onBpmChange={synth.setBpm}
          onTapTempo={synth.tapTempo}
          onToggleTransport={synth.toggleTransport}
        />

        <DistortionModule
          amount={synth.params.effects.distortion.amount}
          wet={synth.params.effects.distortion.wet}
          onAmountChange={synth.setDistortionAmount}
          onWetChange={synth.setDistortionWet}
        />

        <ChorusModule
          params={synth.params.chorus}
          onRateChange={synth.setChorusRate}
          onDepthChange={synth.setChorusDepth}
          onWetChange={synth.setChorusWet}
        />

        <PhaserModule
          params={synth.params.phaser}
          onRateChange={synth.setPhaserRate}
          onDepthChange={synth.setPhaserDepth}
          onWetChange={synth.setPhaserWet}
        />

        <DelayModule
          time={synth.params.effects.delay.time}
          feedback={synth.params.effects.delay.feedback}
          wet={synth.params.effects.delay.wet}
          onTimeChange={synth.setDelayTime}
          onFeedbackChange={synth.setDelayFeedback}
          onWetChange={synth.setDelayWet}
        />

        <ReverbModule
          decay={synth.params.effects.reverb.decay}
          wet={synth.params.effects.reverb.wet}
          onDecayChange={synth.setReverbDecay}
          onWetChange={synth.setReverbWet}
        />

        <ArpeggiatorModule
          params={synth.arpeggiator.params}
          onEnabledChange={synth.setArpEnabled}
          onPatternChange={synth.setArpPattern}
          onRateChange={synth.setArpRate}
          onOctavesChange={synth.setArpOctaves}
        />

        <div className="col-span-2 md:col-span-3 lg:col-span-6">
          <PresetManager
            presets={synth.presets.presets}
            currentPresetId={synth.presets.currentPresetId}
            onLoadPreset={synth.loadPreset}
            onSavePreset={synth.savePreset}
            onDeletePreset={synth.deletePreset}
            onInitPreset={synth.initPreset}
            onReset={synth.handleReset}
            getCurrentParams={synth.getCurrentParams}
            isUserPreset={synth.isUserPreset}
          />
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-ableton-text-muted">
        Built with React, Tone.js, and Tailwind CSS
      </footer>
    </div>
  )
}

export function Synth() {
  const synth = useSynth()

  if (!synth.isInitialized) {
    return <StartOverlay onStart={synth.initializeAudio} />
  }

  return <SynthUI />
}
