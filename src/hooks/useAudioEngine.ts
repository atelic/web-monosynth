import { useState, useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { WaveformType, DEFAULT_MASTER_PARAMS, DEFAULT_EFFECT_PARAMS } from '../types/synth.types'

interface AudioEngineState {
  isInitialized: boolean
  isPlaying: boolean
}

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>({
    isInitialized: false,
    isPlaying: false,
  })

  const synthRef = useRef<Tone.MonoSynth | null>(null)
  const lowpassRef = useRef<Tone.Filter | null>(null)
  const highpassRef = useRef<Tone.Filter | null>(null)
  const distortionRef = useRef<Tone.Distortion | null>(null)
  const delayRef = useRef<Tone.FeedbackDelay | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const meterRef = useRef<Tone.Meter | null>(null)
  const analyserRef = useRef<Tone.Analyser | null>(null)

  const initializeAudio = useCallback(async () => {
    if (state.isInitialized) return

    await Tone.start()

    // Create effects chain
    lowpassRef.current = new Tone.Filter({
      frequency: DEFAULT_EFFECT_PARAMS.lowpass.frequency,
      type: 'lowpass',
      Q: DEFAULT_EFFECT_PARAMS.lowpass.Q,
    })

    highpassRef.current = new Tone.Filter({
      frequency: DEFAULT_EFFECT_PARAMS.highpass.frequency,
      type: 'highpass',
      Q: DEFAULT_EFFECT_PARAMS.highpass.Q,
    })

    distortionRef.current = new Tone.Distortion({
      distortion: DEFAULT_EFFECT_PARAMS.distortion.amount,
      wet: DEFAULT_EFFECT_PARAMS.distortion.wet,
    })

    delayRef.current = new Tone.FeedbackDelay({
      delayTime: DEFAULT_EFFECT_PARAMS.delay.time,
      feedback: DEFAULT_EFFECT_PARAMS.delay.feedback,
      wet: DEFAULT_EFFECT_PARAMS.delay.wet,
    })

    reverbRef.current = new Tone.Reverb({
      decay: DEFAULT_EFFECT_PARAMS.reverb.decay,
      wet: DEFAULT_EFFECT_PARAMS.reverb.wet,
    })

    meterRef.current = new Tone.Meter()
    analyserRef.current = new Tone.Analyser('waveform', 256)

    // Create synth with envelope
    synthRef.current = new Tone.MonoSynth({
      oscillator: {
        type: DEFAULT_MASTER_PARAMS.waveform,
      },
      envelope: {
        attack: DEFAULT_MASTER_PARAMS.attack,
        decay: 0.1,
        sustain: 0.9,
        release: DEFAULT_MASTER_PARAMS.release,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.5,
        baseFrequency: 200,
        octaves: 4,
      },
    })

    synthRef.current.volume.value = DEFAULT_MASTER_PARAMS.volume

    // Connect the chain: synth -> lowpass -> highpass -> distortion -> delay -> reverb -> meter -> analyser -> destination
    synthRef.current.chain(
      lowpassRef.current,
      highpassRef.current,
      distortionRef.current,
      delayRef.current,
      reverbRef.current,
      meterRef.current,
      analyserRef.current,
      Tone.getDestination()
    )

    setState({ isInitialized: true, isPlaying: false })
  }, [state.isInitialized])

  const playNote = useCallback((frequency: number) => {
    if (!synthRef.current) return
    synthRef.current.triggerAttack(frequency)
    setState((s) => ({ ...s, isPlaying: true }))
  }, [])

  const stopNote = useCallback(() => {
    if (!synthRef.current) return
    synthRef.current.triggerRelease()
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  // Master controls
  const setVolume = useCallback((volume: number) => {
    if (!synthRef.current) return
    synthRef.current.volume.rampTo(volume, 0.1)
  }, [])

  const setAttack = useCallback((attack: number) => {
    if (!synthRef.current) return
    synthRef.current.envelope.attack = attack
  }, [])

  const setRelease = useCallback((release: number) => {
    if (!synthRef.current) return
    synthRef.current.envelope.release = release
  }, [])

  const setWaveform = useCallback((waveform: WaveformType) => {
    if (!synthRef.current) return
    synthRef.current.oscillator.type = waveform
  }, [])

  // Filter controls
  const setLowpassFrequency = useCallback((frequency: number) => {
    if (!lowpassRef.current) return
    lowpassRef.current.frequency.rampTo(frequency, 0.1)
  }, [])

  const setLowpassQ = useCallback((q: number) => {
    if (!lowpassRef.current) return
    lowpassRef.current.Q.rampTo(q, 0.1)
  }, [])

  const setHighpassFrequency = useCallback((frequency: number) => {
    if (!highpassRef.current) return
    highpassRef.current.frequency.rampTo(frequency, 0.1)
  }, [])

  const setHighpassQ = useCallback((q: number) => {
    if (!highpassRef.current) return
    highpassRef.current.Q.rampTo(q, 0.1)
  }, [])

  // Distortion controls
  const setDistortionAmount = useCallback((amount: number) => {
    if (!distortionRef.current) return
    distortionRef.current.distortion = amount
  }, [])

  const setDistortionWet = useCallback((wet: number) => {
    if (!distortionRef.current) return
    distortionRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Delay controls
  const setDelayTime = useCallback((time: number) => {
    if (!delayRef.current) return
    delayRef.current.delayTime.rampTo(time, 0.1)
  }, [])

  const setDelayFeedback = useCallback((feedback: number) => {
    if (!delayRef.current) return
    delayRef.current.feedback.rampTo(feedback, 0.1)
  }, [])

  const setDelayWet = useCallback((wet: number) => {
    if (!delayRef.current) return
    delayRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Reverb controls
  const setReverbDecay = useCallback((decay: number) => {
    if (!reverbRef.current) return
    reverbRef.current.decay = decay
  }, [])

  const setReverbWet = useCallback((wet: number) => {
    if (!reverbRef.current) return
    reverbRef.current.wet.rampTo(wet, 0.1)
  }, [])

  // Get meter level
  const getMeterLevel = useCallback((): number => {
    if (!meterRef.current) return -60
    const value = meterRef.current.getValue()
    return typeof value === 'number' ? value : value[0]
  }, [])

  // Get waveform data
  const getWaveformData = useCallback((): Float32Array => {
    if (!analyserRef.current) return new Float32Array(256)
    return analyserRef.current.getValue() as Float32Array
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      lowpassRef.current?.dispose()
      highpassRef.current?.dispose()
      distortionRef.current?.dispose()
      delayRef.current?.dispose()
      reverbRef.current?.dispose()
      meterRef.current?.dispose()
      analyserRef.current?.dispose()
    }
  }, [])

  return {
    isInitialized: state.isInitialized,
    isPlaying: state.isPlaying,
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
  }
}
