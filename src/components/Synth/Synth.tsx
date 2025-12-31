import { useCallback } from 'react'
import { useSynth } from '../../context'
import { useKeyboard } from '../../hooks/useKeyboard'
import {
  WaveformType,
  NoiseType,
  LFOWaveform,
  ArpPattern,
  ArpRate,
} from '../../types/synth.types'
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
  const {
    params,
    setParams,
    pitchBendValue,
    activeKeys,
    isInitialized,
    isPlaying,
    handleNoteOn,
    handleNoteOff,
    handleOctaveChange,
    // Parameter setters
    setVolume,
    setAttack,
    setRelease,
    setWaveform,
    setOctave,
    setMonoMode,
    setSubOscLevel,
    setSubOscOctave,
    setNoiseLevel,
    setNoiseType,
    setGlideEnabled,
    setGlideTime,
    setPitchBend,
    setPitchBendRange,
    setLFORate,
    setLFODepth,
    setLFOWaveform,
    setLowpassFrequency,
    setLowpassQ,
    setHighpassFrequency,
    setHighpassQ,
    setFilterEnvAttack,
    setFilterEnvDecay,
    setFilterEnvSustain,
    setFilterEnvRelease,
    setFilterEnvAmount,
    setDistortionAmount,
    setDistortionWet,
    setChorusRate,
    setChorusDepth,
    setChorusWet,
    setPhaserRate,
    setPhaserDepth,
    setPhaserWet,
    setDelayTime,
    setDelayFeedback,
    setDelayWet,
    setReverbDecay,
    setReverbWet,
    // Visualizers
    getMeterLevel,
    getWaveformData,
    getFFTData,
    // Tempo
    tempo,
    // Arpeggiator
    arpeggiator,
    // Presets
    presets,
    handleLoadPreset,
    handleInitPreset,
    handleReset,
    getCurrentParams,
    handleRoutingChange,
  } = synth

  useKeyboard({
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
    onOctaveChange: handleOctaveChange,
    enabled: isInitialized,
  })

  // Memoized handlers that update both state and audio engine
  const handleVolumeChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, volume: v } }))
    setVolume(v)
  }, [setParams, setVolume])

  const handleAttackChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, attack: v } }))
    setAttack(v)
  }, [setParams, setAttack])

  const handleReleaseChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, release: v } }))
    setRelease(v)
  }, [setParams, setRelease])

  const handleWaveformChange = useCallback((v: WaveformType) => {
    setParams((p) => ({ 
      ...p, 
      master: { ...p.master, waveform: v }, 
      oscillator: { ...p.oscillator, waveform: v } 
    }))
    setWaveform(v)
  }, [setParams, setWaveform])

  const handleOctaveValueChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, octave: v } }))
    setOctave(v)
  }, [setParams, setOctave])

  const handleMonoChange = useCallback((v: boolean) => {
    setParams((p) => ({ ...p, master: { ...p.master, mono: v } }))
    setMonoMode(v)
  }, [setParams, setMonoMode])

  const handleSubOscLevelChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, subOscLevel: v } }))
    setSubOscLevel(v)
  }, [setParams, setSubOscLevel])

  const handleSubOscOctaveChange = useCallback((v: -1 | -2) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, subOscOctave: v } }))
    setSubOscOctave(v)
  }, [setParams, setSubOscOctave])

  const handleNoiseLevelChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, noiseLevel: v } }))
    setNoiseLevel(v)
  }, [setParams, setNoiseLevel])

  const handleNoiseTypeChange = useCallback((v: NoiseType) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, noiseType: v } }))
    setNoiseType(v)
  }, [setParams, setNoiseType])

  const handleGlideEnabledChange = useCallback((v: boolean) => {
    setParams((p) => ({ ...p, glide: { ...p.glide, enabled: v } }))
    setGlideEnabled(v)
  }, [setParams, setGlideEnabled])

  const handleGlideTimeChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, glide: { ...p.glide, time: v } }))
    setGlideTime(v)
  }, [setParams, setGlideTime])

  const handlePitchBendRangeChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, pitchBendRange: v }))
    setPitchBendRange(v)
  }, [setParams, setPitchBendRange])

  const handleLFORateChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, rate: v } }))
    setLFORate(v)
  }, [setParams, setLFORate])

  const handleLFODepthChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, depth: v } }))
    setLFODepth(v)
  }, [setParams, setLFODepth])

  const handleLFOWaveformChange = useCallback((v: LFOWaveform) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, waveform: v } }))
    setLFOWaveform(v)
  }, [setParams, setLFOWaveform])

  const handleLowpassFreqChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, lowpass: { ...p.effects.lowpass, frequency: v } } }))
    setLowpassFrequency(v)
  }, [setParams, setLowpassFrequency])

  const handleLowpassQChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, lowpass: { ...p.effects.lowpass, Q: v } } }))
    setLowpassQ(v)
  }, [setParams, setLowpassQ])

  const handleHighpassFreqChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, highpass: { ...p.effects.highpass, frequency: v } } }))
    setHighpassFrequency(v)
  }, [setParams, setHighpassFrequency])

  const handleHighpassQChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, highpass: { ...p.effects.highpass, Q: v } } }))
    setHighpassQ(v)
  }, [setParams, setHighpassQ])

  const handleFilterEnvAttackChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, attack: v } }))
    setFilterEnvAttack(v)
  }, [setParams, setFilterEnvAttack])

  const handleFilterEnvDecayChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, decay: v } }))
    setFilterEnvDecay(v)
  }, [setParams, setFilterEnvDecay])

  const handleFilterEnvSustainChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, sustain: v } }))
    setFilterEnvSustain(v)
  }, [setParams, setFilterEnvSustain])

  const handleFilterEnvReleaseChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, release: v } }))
    setFilterEnvRelease(v)
  }, [setParams, setFilterEnvRelease])

  const handleFilterEnvAmountChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, amount: v } }))
    setFilterEnvAmount(v)
  }, [setParams, setFilterEnvAmount])

  const handleDistortionAmountChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, distortion: { ...p.effects.distortion, amount: v } } }))
    setDistortionAmount(v)
  }, [setParams, setDistortionAmount])

  const handleDistortionWetChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, distortion: { ...p.effects.distortion, wet: v } } }))
    setDistortionWet(v)
  }, [setParams, setDistortionWet])

  const handleChorusRateChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, rate: v } }))
    setChorusRate(v)
  }, [setParams, setChorusRate])

  const handleChorusDepthChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, depth: v } }))
    setChorusDepth(v)
  }, [setParams, setChorusDepth])

  const handleChorusWetChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, wet: v } }))
    setChorusWet(v)
  }, [setParams, setChorusWet])

  const handlePhaserRateChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, rate: v } }))
    setPhaserRate(v)
  }, [setParams, setPhaserRate])

  const handlePhaserDepthChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, depth: v } }))
    setPhaserDepth(v)
  }, [setParams, setPhaserDepth])

  const handlePhaserWetChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, wet: v } }))
    setPhaserWet(v)
  }, [setParams, setPhaserWet])

  const handleDelayTimeChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, time: v } } }))
    setDelayTime(v)
  }, [setParams, setDelayTime])

  const handleDelayFeedbackChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, feedback: v } } }))
    setDelayFeedback(v)
  }, [setParams, setDelayFeedback])

  const handleDelayWetChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, wet: v } } }))
    setDelayWet(v)
  }, [setParams, setDelayWet])

  const handleReverbDecayChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, reverb: { ...p.effects.reverb, decay: v } } }))
    setReverbDecay(v)
  }, [setParams, setReverbDecay])

  const handleReverbWetChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, reverb: { ...p.effects.reverb, wet: v } } }))
    setReverbWet(v)
  }, [setParams, setReverbWet])

  const handleBpmChange = useCallback((v: number) => {
    setParams((p) => ({ ...p, tempo: { ...p.tempo, bpm: v } }))
    tempo.setBpm(v)
  }, [setParams, tempo])

  const handleArpEnabledChange = useCallback((v: boolean) => {
    arpeggiator.setEnabled(v)
    if (!v) arpeggiator.clearNotes()
  }, [arpeggiator])

  const handleArpPatternChange = useCallback((v: ArpPattern) => {
    arpeggiator.setPattern(v)
  }, [arpeggiator])

  const handleArpRateChange = useCallback((v: ArpRate) => {
    arpeggiator.setRate(v)
  }, [arpeggiator])

  const handleArpOctavesChange = useCallback((v: 1 | 2 | 3) => {
    arpeggiator.setOctaves(v)
  }, [arpeggiator])

  return (
    <div className="min-h-screen bg-ableton-bg p-3 md:p-4">
      {/* Compact Header with inline visualizers */}
      <header className="mb-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-ableton-text">Web PolySynth</h1>
          <p className="text-xs text-ableton-text-dim">4-voice polyphonic</p>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <WaveformDisplay
            className="flex-1 min-w-0"
            getWaveformData={getWaveformData}
            isPlaying={isPlaying}
            compact
          />
          <SpectrumAnalyzer
            getFFTData={getFFTData}
            isActive={isInitialized}
            compact
            className="w-32 flex-shrink-0"
          />
          <VUMeter
            getMeterLevel={getMeterLevel}
            isPlaying={isPlaying}
            compact
            className="w-32 flex-shrink-0"
          />
        </div>
      </header>

      {/* Keyboard - prominent position */}
      <div className="mb-3">
        <Keyboard
          activeKeys={activeKeys}
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
        />
      </div>

      {/* Controls grid - compact 6-column layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sound sources */}
        <OscillatorModule
          params={params.oscillator}
          onWaveformChange={handleWaveformChange}
          onSubOscLevelChange={handleSubOscLevelChange}
          onSubOscOctaveChange={handleSubOscOctaveChange}
          onNoiseLevelChange={handleNoiseLevelChange}
          onNoiseTypeChange={handleNoiseTypeChange}
        />

        <PitchModule
          glideParams={params.glide}
          pitchBendValue={pitchBendValue}
          pitchBendRange={params.pitchBendRange}
          onGlideEnabledChange={handleGlideEnabledChange}
          onGlideTimeChange={handleGlideTimeChange}
          onPitchBendChange={setPitchBend}
          onPitchBendRangeChange={handlePitchBendRangeChange}
        />

        <LFOModule
          lfoParams={params.lfo}
          modRouting={params.modRouting}
          onRateChange={handleLFORateChange}
          onDepthChange={handleLFODepthChange}
          onWaveformChange={handleLFOWaveformChange}
          onRoutingChange={handleRoutingChange}
        />

        <FilterModule
          lowpassFreq={params.effects.lowpass.frequency}
          lowpassQ={params.effects.lowpass.Q}
          highpassFreq={params.effects.highpass.frequency}
          highpassQ={params.effects.highpass.Q}
          filterEnvelope={params.filterEnvelope}
          onLowpassFreqChange={handleLowpassFreqChange}
          onLowpassQChange={handleLowpassQChange}
          onHighpassFreqChange={handleHighpassFreqChange}
          onHighpassQChange={handleHighpassQChange}
          onFilterEnvAttackChange={handleFilterEnvAttackChange}
          onFilterEnvDecayChange={handleFilterEnvDecayChange}
          onFilterEnvSustainChange={handleFilterEnvSustainChange}
          onFilterEnvReleaseChange={handleFilterEnvReleaseChange}
          onFilterEnvAmountChange={handleFilterEnvAmountChange}
        />

        <MasterModule
          volume={params.master.volume}
          attack={params.master.attack}
          release={params.master.release}
          waveform={params.master.waveform}
          octave={params.master.octave}
          mono={params.master.mono}
          onVolumeChange={handleVolumeChange}
          onAttackChange={handleAttackChange}
          onReleaseChange={handleReleaseChange}
          onWaveformChange={handleWaveformChange}
          onOctaveChange={handleOctaveValueChange}
          onMonoChange={handleMonoChange}
        />

        {/* Effects */}
        <DistortionModule
          amount={params.effects.distortion.amount}
          wet={params.effects.distortion.wet}
          onAmountChange={handleDistortionAmountChange}
          onWetChange={handleDistortionWetChange}
        />

        <ChorusModule
          params={params.chorus}
          onRateChange={handleChorusRateChange}
          onDepthChange={handleChorusDepthChange}
          onWetChange={handleChorusWetChange}
        />

        <PhaserModule
          params={params.phaser}
          onRateChange={handlePhaserRateChange}
          onDepthChange={handlePhaserDepthChange}
          onWetChange={handlePhaserWetChange}
        />

        <DelayModule
          time={params.effects.delay.time}
          feedback={params.effects.delay.feedback}
          wet={params.effects.delay.wet}
          onTimeChange={handleDelayTimeChange}
          onFeedbackChange={handleDelayFeedbackChange}
          onWetChange={handleDelayWetChange}
        />

        <ReverbModule
          decay={params.effects.reverb.decay}
          wet={params.effects.reverb.wet}
          onDecayChange={handleReverbDecayChange}
          onWetChange={handleReverbWetChange}
        />

        <ArpeggiatorModule
          params={arpeggiator.params}
          onEnabledChange={handleArpEnabledChange}
          onPatternChange={handleArpPatternChange}
          onRateChange={handleArpRateChange}
          onOctavesChange={handleArpOctavesChange}
        />

        <TempoModule
          bpm={tempo.bpm}
          isPlaying={tempo.isPlaying}
          onBpmChange={handleBpmChange}
          onTapTempo={tempo.tapTempo}
          onToggleTransport={tempo.toggleTransport}
        />

        {/* Presets - full width */}
        <div className="col-span-2 md:col-span-3 lg:col-span-6">
          <PresetManager
            presets={presets.presets}
            currentPresetId={presets.currentPresetId}
            onLoadPreset={handleLoadPreset}
            onSavePreset={presets.savePreset}
            onDeletePreset={presets.deletePreset}
            onInitPreset={handleInitPreset}
            onReset={handleReset}
            getCurrentParams={getCurrentParams}
            isUserPreset={presets.isUserPreset}
          />
        </div>
      </div>

      {/* Footer */}
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
