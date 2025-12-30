import { useState, useCallback } from 'react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useKeyboard } from '../../hooks/useKeyboard'
import { getFrequency } from '../../constants/frequencies'
import {
  WaveformType,
  DEFAULT_MASTER_PARAMS,
  DEFAULT_EFFECT_PARAMS,
} from '../../types/synth.types'
import { Keyboard } from '../Keyboard'
import {
  MasterModule,
  FilterModule,
  ReverbModule,
  DelayModule,
  DistortionModule,
} from '../Modules'
import { VUMeter, WaveformDisplay } from '../Visualizers'

interface SynthParams {
  volume: number
  attack: number
  release: number
  waveform: WaveformType
  octave: number
  lowpassFreq: number
  lowpassQ: number
  highpassFreq: number
  highpassQ: number
  reverbDecay: number
  reverbWet: number
  delayTime: number
  delayFeedback: number
  delayWet: number
  distortionAmount: number
  distortionWet: number
}

function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-ableton-bg flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-ableton-text">Web MonoSynth</h1>
      <p className="text-ableton-text-dim max-w-md text-center">
        A monophonic synthesizer you can play right in your browser.
        <br />
        Use your keyboard or click the keys to play.
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

export function Synth() {
  const {
    isInitialized,
    isPlaying,
    initializeAudio,
    playNote,
    stopNote,
    setVolume,
    setAttack,
    setRelease,
    setWaveform,
    setLowpassFrequency,
    setLowpassQ,
    setHighpassFrequency,
    setHighpassQ,
    setDistortionAmount,
    setDistortionWet,
    setDelayTime,
    setDelayFeedback,
    setDelayWet,
    setReverbDecay,
    setReverbWet,
    getMeterLevel,
    getWaveformData,
  } = useAudioEngine()

  const [params, setParams] = useState<SynthParams>({
    volume: DEFAULT_MASTER_PARAMS.volume,
    attack: DEFAULT_MASTER_PARAMS.attack,
    release: DEFAULT_MASTER_PARAMS.release,
    waveform: DEFAULT_MASTER_PARAMS.waveform,
    octave: DEFAULT_MASTER_PARAMS.octave,
    lowpassFreq: DEFAULT_EFFECT_PARAMS.lowpass.frequency,
    lowpassQ: DEFAULT_EFFECT_PARAMS.lowpass.Q,
    highpassFreq: DEFAULT_EFFECT_PARAMS.highpass.frequency,
    highpassQ: DEFAULT_EFFECT_PARAMS.highpass.Q,
    reverbDecay: DEFAULT_EFFECT_PARAMS.reverb.decay,
    reverbWet: DEFAULT_EFFECT_PARAMS.reverb.wet,
    delayTime: DEFAULT_EFFECT_PARAMS.delay.time,
    delayFeedback: DEFAULT_EFFECT_PARAMS.delay.feedback,
    delayWet: DEFAULT_EFFECT_PARAMS.delay.wet,
    distortionAmount: DEFAULT_EFFECT_PARAMS.distortion.amount,
    distortionWet: DEFAULT_EFFECT_PARAMS.distortion.wet,
  })

  const [activeKey, setActiveKey] = useState<string | null>(null)

  const handleNoteOn = useCallback(
    (code: string) => {
      const freq = getFrequency(code, params.octave)
      if (freq) {
        playNote(freq)
        setActiveKey(code)
      }
    },
    [params.octave, playNote]
  )

  const handleNoteOff = useCallback(() => {
    stopNote()
    setActiveKey(null)
  }, [stopNote])

  const handleOctaveChange = useCallback((direction: 'up' | 'down') => {
    setParams((prev) => ({
      ...prev,
      octave: Math.max(0, Math.min(5, prev.octave + (direction === 'up' ? 1 : -1))),
    }))
  }, [])

  useKeyboard({
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
    onOctaveChange: handleOctaveChange,
    enabled: isInitialized,
  })

  // Parameter change handlers with audio engine sync
  const updateParam = useCallback(
    <K extends keyof SynthParams>(key: K, value: SynthParams[K], audioFn?: () => void) => {
      setParams((prev) => ({ ...prev, [key]: value }))
      audioFn?.()
    },
    []
  )

  if (!isInitialized) {
    return <StartOverlay onStart={initializeAudio} />
  }

  return (
    <div className="min-h-screen bg-ableton-bg p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ableton-text">Web MonoSynth</h1>
        <p className="text-sm text-ableton-text-dim">
          Monophonic synthesizer with effects
        </p>
      </header>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <MasterModule
          className="md:col-span-2"
          volume={params.volume}
          attack={params.attack}
          release={params.release}
          waveform={params.waveform}
          octave={params.octave}
          onVolumeChange={(v) => updateParam('volume', v, () => setVolume(v))}
          onAttackChange={(v) => updateParam('attack', v, () => setAttack(v))}
          onReleaseChange={(v) => updateParam('release', v, () => setRelease(v))}
          onWaveformChange={(v) => updateParam('waveform', v, () => setWaveform(v))}
          onOctaveChange={(v) => updateParam('octave', v)}
        />

        <FilterModule
          lowpassFreq={params.lowpassFreq}
          lowpassQ={params.lowpassQ}
          highpassFreq={params.highpassFreq}
          highpassQ={params.highpassQ}
          onLowpassFreqChange={(v) => updateParam('lowpassFreq', v, () => setLowpassFrequency(v))}
          onLowpassQChange={(v) => updateParam('lowpassQ', v, () => setLowpassQ(v))}
          onHighpassFreqChange={(v) => updateParam('highpassFreq', v, () => setHighpassFrequency(v))}
          onHighpassQChange={(v) => updateParam('highpassQ', v, () => setHighpassQ(v))}
        />

        <ReverbModule
          decay={params.reverbDecay}
          wet={params.reverbWet}
          onDecayChange={(v) => updateParam('reverbDecay', v, () => setReverbDecay(v))}
          onWetChange={(v) => updateParam('reverbWet', v, () => setReverbWet(v))}
        />

        {/* Row 2 */}
        <Keyboard
          className="md:col-span-2 lg:row-span-2"
          activeKey={activeKey}
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
        />

        <DelayModule
          time={params.delayTime}
          feedback={params.delayFeedback}
          wet={params.delayWet}
          onTimeChange={(v) => updateParam('delayTime', v, () => setDelayTime(v))}
          onFeedbackChange={(v) => updateParam('delayFeedback', v, () => setDelayFeedback(v))}
          onWetChange={(v) => updateParam('delayWet', v, () => setDelayWet(v))}
        />

        <DistortionModule
          amount={params.distortionAmount}
          wet={params.distortionWet}
          onAmountChange={(v) => updateParam('distortionAmount', v, () => setDistortionAmount(v))}
          onWetChange={(v) => updateParam('distortionWet', v, () => setDistortionWet(v))}
        />

        {/* Row 3 - Visualizers */}
        <WaveformDisplay
          className="md:col-span-2 lg:col-span-3"
          getWaveformData={getWaveformData}
          isPlaying={isPlaying}
        />

        <VUMeter
          getMeterLevel={getMeterLevel}
          isPlaying={isPlaying}
        />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-ableton-text-muted">
        Built with React, Tone.js, and Tailwind CSS
      </footer>
    </div>
  )
}
