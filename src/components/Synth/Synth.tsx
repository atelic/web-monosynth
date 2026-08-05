import { useState } from 'react'
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

type BootState = 'idle' | 'starting' | 'error'

function StartOverlay({ onStart }: { onStart: () => Promise<void> }) {
  const [bootState, setBootState] = useState<BootState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleStart = async () => {
    if (bootState === 'starting') return

    setBootState('starting')
    setErrorMessage('')

    try {
      await onStart()
    } catch (error) {
      console.error('Unable to start audio engine:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Audio could not be started.')
      setBootState('error')
    }
  }

  const statusLabel =
    bootState === 'starting'
      ? 'Starting audio engine'
      : bootState === 'error'
        ? 'Audio engine unavailable'
        : 'Audio engine offline'

  return (
    <div className="start-room min-h-[100dvh] bg-ableton-bg px-4 py-4">
      <div className="power-console">
        <div className="power-console__rail" aria-hidden="true" />
        <div className="power-console__face">
          <div className="power-console__identity">
            <p className="brand-model">ATELIC INSTRUMENTS / MODEL P-4</p>
            <h1 className="start-title">Polyphonic Synthesizer</h1>
          </div>
          <div className="power-console__controls">
            <button
              type="button"
              onClick={handleStart}
              className="start-display"
              disabled={bootState === 'starting'}
            >
              <span
                className={`status-dot ${bootState === 'starting' ? 'status-dot--starting' : 'status-dot--idle'}`}
              />
              <span>{statusLabel}</span>
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="power-switch"
              disabled={bootState === 'starting'}
            >
              <span className="power-switch__lamp" />
              <span>
                {bootState === 'starting'
                  ? 'Starting'
                  : bootState === 'error'
                    ? 'Try again'
                    : 'Power on'}
              </span>
            </button>
            {bootState === 'error' ? (
              <p className="start-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
        <div className="power-console__rail" aria-hidden="true" />
      </div>
    </div>
  )
}

type MobilePanel = 'voice' | 'shape' | 'mod' | 'fx'

const MOBILE_PANELS: { id: MobilePanel; label: string }[] = [
  { id: 'voice', label: 'Voice' },
  { id: 'shape', label: 'Shape' },
  { id: 'mod', label: 'Mod / Arp' },
  { id: 'fx', label: 'Effects' },
]

function SynthUI() {
  const synth = useSynth()
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('voice')

  useKeyboard({
    onNoteOn: synth.handleNoteOn,
    onNoteOff: synth.handleNoteOff,
    onOctaveChange: synth.handleOctaveChange,
    enabled: synth.isInitialized,
  })

  return (
    <div className="synth-shell min-h-[100dvh] bg-ableton-bg p-2 sm:p-3 lg:p-5">
      <div className="synth-chassis">
        <header className="synth-header">
          <div className="brand-block">
            <p className="brand-model">ATELIC INSTRUMENTS</p>
            <h1 className="brand-title">
              POLYSYNTH <span>P-4</span>
            </h1>
          </div>
          <div className="preset-strip">
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
          <div className="scope-cluster">
            <div className="signal-readout">
              <span className="status-dot" />
              <span>{synth.isPlaying ? 'Signal' : 'Ready'}</span>
              <strong>{Math.round(synth.tempo.bpm)}</strong>
              <small>BPM</small>
            </div>
            <VisualizerErrorBoundary name="Waveform">
              <WaveformDisplay
                className="scope-wave"
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
                className="scope-spectrum"
              />
            </VisualizerErrorBoundary>
            <VisualizerErrorBoundary name="VU Meter">
              <VUMeter
                getMeterLevel={synth.getMeterLevel}
                isPlaying={synth.isPlaying}
                compact
                className="scope-meter"
              />
            </VisualizerErrorBoundary>
          </div>
        </header>

        <nav className="mobile-panel-nav" aria-label="Synth control banks">
          {MOBILE_PANELS.map((panel) => (
            <button
              key={panel.id}
              className={mobilePanel === panel.id ? 'is-active' : ''}
              onClick={() => setMobilePanel(panel.id)}
              aria-pressed={mobilePanel === panel.id}
            >
              {panel.label}
            </button>
          ))}
        </nav>

        <div className="module-rack">
          <section
            className={`instrument-bank bank-voice ${mobilePanel === 'voice' ? 'is-active' : ''}`}
            aria-label="Voice controls"
          >
            <PitchModule
              className="rack-pitch"
              glideParams={synth.params.glide}
              pitchBendValue={synth.pitchBendValue}
              pitchBendRange={synth.params.pitchBendRange}
              onGlideEnabledChange={synth.setGlideEnabled}
              onGlideTimeChange={synth.setGlideTime}
              onPitchBendChange={synth.setPitchBend}
              onPitchBendRangeChange={synth.setPitchBendRange}
            />
            <OscillatorModule
              className="rack-oscillator"
              params={synth.params.oscillator}
              onWaveformChange={synth.setWaveform}
              onSubOscLevelChange={synth.setSubOscLevel}
              onSubOscOctaveChange={synth.setSubOscOctave}
              onNoiseLevelChange={synth.setNoiseLevel}
              onNoiseTypeChange={synth.setNoiseType}
            />
            <MasterModule
              className="rack-master"
              volume={synth.params.master.volume}
              attack={synth.params.master.attack}
              release={synth.params.master.release}
              octave={synth.params.master.octave}
              mono={synth.params.master.mono}
              onVolumeChange={synth.setVolume}
              onAttackChange={synth.setAttack}
              onReleaseChange={synth.setRelease}
              onOctaveChange={synth.setOctave}
              onMonoChange={synth.setMonoMode}
            />
          </section>

          <section
            className={`instrument-bank bank-shape ${mobilePanel === 'shape' ? 'is-active' : ''}`}
            aria-label="Filter and envelope controls"
          >
            <FilterModule
              className="rack-filter"
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
          </section>

          <section
            className={`instrument-bank bank-mod ${mobilePanel === 'mod' ? 'is-active' : ''}`}
            aria-label="Modulation and arpeggiator controls"
          >
            <LFOModule
              className="rack-lfo"
              lfoParams={synth.params.lfo}
              modRouting={synth.params.modRouting}
              onRateChange={synth.setLFORate}
              onDepthChange={synth.setLFODepth}
              onWaveformChange={synth.setLFOWaveform}
              onRoutingChange={synth.setModRouting}
            />
            <TempoModule
              className="rack-tempo"
              bpm={synth.tempo.bpm}
              isPlaying={synth.tempo.isPlaying}
              onBpmChange={synth.setBpm}
              onTapTempo={synth.tapTempo}
              onToggleTransport={synth.toggleTransport}
            />
            <ArpeggiatorModule
              className="rack-arpeggiator"
              params={synth.arpeggiator.params}
              onEnabledChange={synth.setArpEnabled}
              onPatternChange={synth.setArpPattern}
              onRateChange={synth.setArpRate}
              onOctavesChange={synth.setArpOctaves}
            />
          </section>

          <section
            className={`instrument-bank bank-fx ${mobilePanel === 'fx' ? 'is-active' : ''}`}
            aria-label="Effects controls"
          >
            <DistortionModule
              className="rack-distortion"
              amount={synth.params.effects.distortion.amount}
              wet={synth.params.effects.distortion.wet}
              onAmountChange={synth.setDistortionAmount}
              onWetChange={synth.setDistortionWet}
            />
            <ChorusModule
              className="rack-chorus"
              params={synth.params.chorus}
              onRateChange={synth.setChorusRate}
              onDepthChange={synth.setChorusDepth}
              onWetChange={synth.setChorusWet}
            />
            <PhaserModule
              className="rack-phaser"
              params={synth.params.phaser}
              onRateChange={synth.setPhaserRate}
              onDepthChange={synth.setPhaserDepth}
              onWetChange={synth.setPhaserWet}
            />
            <DelayModule
              className="rack-delay"
              time={synth.params.effects.delay.time}
              feedback={synth.params.effects.delay.feedback}
              wet={synth.params.effects.delay.wet}
              onTimeChange={synth.setDelayTime}
              onFeedbackChange={synth.setDelayFeedback}
              onWetChange={synth.setDelayWet}
            />
            <ReverbModule
              className="rack-reverb"
              decay={synth.params.effects.reverb.decay}
              wet={synth.params.effects.reverb.wet}
              onDecayChange={synth.setReverbDecay}
              onWetChange={synth.setReverbWet}
            />
          </section>
        </div>

        <div className="signal-path" aria-hidden="true">
          <span>VOICE</span>
          <i />
          <span>FILTER</span>
          <i />
          <span>MOD</span>
          <i />
          <span>FX</span>
          <i />
          <span>OUT</span>
        </div>

        <div className="keybed-stage">
          <Keyboard
            activeKeys={synth.activeKeys}
            onNoteOn={synth.handleNoteOn}
            onNoteOff={synth.handleNoteOff}
          />
        </div>

        <footer className="synth-footer">
          <span>Web audio instrument</span>
          <span>React / Tone.js</span>
        </footer>
      </div>
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
