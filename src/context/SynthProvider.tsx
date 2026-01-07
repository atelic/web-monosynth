import { useState, useCallback, useRef, useMemo, ReactNode } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { usePresets, DEFAULT_PRESET_PARAMS } from '../hooks/usePresets'
import { useTempo } from '../hooks/useTempo'
import { useArpeggiator } from '../hooks/useArpeggiator'
import {
  SynthPresetParams,
  ModulationTarget,
  WaveformType,
  NoiseType,
  LFOWaveform,
  ArpPattern,
  ArpRate,
} from '../types/synth.types'
import { SynthStateContext } from './SynthStateContext'
import { SynthActionsContext } from './SynthActionsContext'
import { SynthStateContextValue, SynthActionsContextValue } from './types'

interface SynthProviderProps {
  children: ReactNode
  getFrequency: (code: string, octave: number) => number | null
}

export function SynthProvider({ children, getFrequency }: SynthProviderProps) {
  const audioEngine = useAudioEngine()
  const presetsHook = usePresets()
  const tempoHook = useTempo()

  const [params, setParams] = useState<SynthPresetParams>(DEFAULT_PRESET_PARAMS)
  const [pitchBendValue, setPitchBendValue] = useState(0)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

  const activeKeyFrequenciesRef = useRef<Map<string, number>>(new Map())

  const arpeggiatorHook = useArpeggiator({
    playNote: audioEngine.playNote,
    stopNote: audioEngine.stopNote,
    stopAllNotes: audioEngine.stopAllNotes,
    playArpNote: audioEngine.playArpNote,
    stopArpNote: audioEngine.stopArpNote,
    getNoteTime: tempoHook.getNoteTime,
    getToneTime: tempoHook.getToneTime,
    setArpeggiating: audioEngine.setArpeggiating,
    requestTransportStart: tempoHook.requestTransportStart,
    releaseTransport: tempoHook.releaseTransport,
  })

  const arpEnabled = arpeggiatorHook.params.enabled

  const playNote = useCallback(
    (frequency: number) => {
      if (arpEnabled) {
        arpeggiatorHook.addNote(frequency)
      } else {
        audioEngine.playNote(frequency)
      }
    },
    [arpEnabled, arpeggiatorHook, audioEngine]
  )

  const stopNote = useCallback(
    (frequency: number) => {
      if (arpEnabled) {
        arpeggiatorHook.removeNote(frequency)
      } else {
        audioEngine.stopNote(frequency)
      }
    },
    [arpEnabled, arpeggiatorHook, audioEngine]
  )

  const handleNoteOn = useCallback(
    (code: string) => {
      const freq = getFrequency(code, params.master.octave)
      if (freq) {
        playNote(freq)
        setActiveKeys((prev) => new Set(prev).add(code))
        activeKeyFrequenciesRef.current.set(code, freq)
      }
    },
    [params.master.octave, playNote, getFrequency]
  )

  const handleNoteOff = useCallback(
    (code: string) => {
      const freq = activeKeyFrequenciesRef.current.get(code)
      if (freq) {
        stopNote(freq)
        setActiveKeys((prev) => {
          const next = new Set(prev)
          next.delete(code)
          return next
        })
        activeKeyFrequenciesRef.current.delete(code)
      }
    },
    [stopNote]
  )

  const handleOctaveChange = useCallback(
    (direction: 'up' | 'down') => {
      const newOctave = Math.max(
        0,
        Math.min(5, params.master.octave + (direction === 'up' ? 1 : -1))
      )
      setParams((prev) => ({
        ...prev,
        master: { ...prev.master, octave: newOctave },
      }))
      audioEngine.setOctave(newOctave)
    },
    [params.master.octave, audioEngine]
  )

  const syncParamsToEngine = useCallback(
    (loadedParams: SynthPresetParams) => {
      audioEngine.setVolume(loadedParams.master.volume)
      audioEngine.setAttack(loadedParams.master.attack)
      audioEngine.setRelease(loadedParams.master.release)
      audioEngine.setWaveform(loadedParams.master.waveform)
      audioEngine.setOctave(loadedParams.master.octave)
      audioEngine.setMonoMode(loadedParams.master.mono)
      audioEngine.setSubOscLevel(loadedParams.oscillator.subOscLevel)
      audioEngine.setSubOscOctave(loadedParams.oscillator.subOscOctave)
      audioEngine.setNoiseLevel(loadedParams.oscillator.noiseLevel)
      audioEngine.setNoiseType(loadedParams.oscillator.noiseType)
      audioEngine.setGlideEnabled(loadedParams.glide.enabled)
      audioEngine.setGlideTime(loadedParams.glide.time)
      audioEngine.setPitchBendRange(loadedParams.pitchBendRange)
      audioEngine.setLFORate(loadedParams.lfo.rate)
      audioEngine.setLFODepth(loadedParams.lfo.depth)
      audioEngine.setLFOWaveform(loadedParams.lfo.waveform)
      loadedParams.modRouting.forEach((r) => {
        audioEngine.setModRouting(r.target, r.amount, r.enabled)
      })
      audioEngine.setLowpassFrequency(loadedParams.effects.lowpass.frequency)
      audioEngine.setLowpassQ(loadedParams.effects.lowpass.Q)
      audioEngine.setHighpassFrequency(loadedParams.effects.highpass.frequency)
      audioEngine.setHighpassQ(loadedParams.effects.highpass.Q)
      audioEngine.setFilterEnvAttack(loadedParams.filterEnvelope.attack)
      audioEngine.setFilterEnvDecay(loadedParams.filterEnvelope.decay)
      audioEngine.setFilterEnvSustain(loadedParams.filterEnvelope.sustain)
      audioEngine.setFilterEnvRelease(loadedParams.filterEnvelope.release)
      audioEngine.setFilterEnvAmount(loadedParams.filterEnvelope.amount)
      audioEngine.setDistortionAmount(loadedParams.effects.distortion.amount)
      audioEngine.setDistortionWet(loadedParams.effects.distortion.wet)
      audioEngine.setChorusRate(loadedParams.chorus.rate)
      audioEngine.setChorusDepth(loadedParams.chorus.depth)
      audioEngine.setChorusWet(loadedParams.chorus.wet)
      audioEngine.setPhaserRate(loadedParams.phaser.rate)
      audioEngine.setPhaserDepth(loadedParams.phaser.depth)
      audioEngine.setPhaserWet(loadedParams.phaser.wet)
      audioEngine.setDelayTime(loadedParams.effects.delay.time)
      audioEngine.setDelayFeedback(loadedParams.effects.delay.feedback)
      audioEngine.setDelayWet(loadedParams.effects.delay.wet)
      audioEngine.setReverbDecay(loadedParams.effects.reverb.decay)
      audioEngine.setReverbWet(loadedParams.effects.reverb.wet)
      tempoHook.setBpm(loadedParams.tempo.bpm)
      arpeggiatorHook.setEnabled(loadedParams.arpeggiator.enabled)
      arpeggiatorHook.setPattern(loadedParams.arpeggiator.pattern)
      arpeggiatorHook.setRate(loadedParams.arpeggiator.rate)
      arpeggiatorHook.setOctaves(loadedParams.arpeggiator.octaves)
    },
    [audioEngine, tempoHook, arpeggiatorHook]
  )

  const setVolume = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, volume: v } }))
    audioEngine.setVolume(v)
  }, [audioEngine])

  const setAttack = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, attack: v } }))
    audioEngine.setAttack(v)
  }, [audioEngine])

  const setRelease = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, release: v } }))
    audioEngine.setRelease(v)
  }, [audioEngine])

  const setWaveform = useCallback((v: WaveformType) => {
    setParams((p) => ({
      ...p,
      master: { ...p.master, waveform: v },
      oscillator: { ...p.oscillator, waveform: v }
    }))
    audioEngine.setWaveform(v)
  }, [audioEngine])

  const setOctave = useCallback((v: number) => {
    setParams((p) => ({ ...p, master: { ...p.master, octave: v } }))
    audioEngine.setOctave(v)
  }, [audioEngine])

  const setMonoMode = useCallback((v: boolean) => {
    setParams((p) => ({ ...p, master: { ...p.master, mono: v } }))
    audioEngine.setMonoMode(v)
  }, [audioEngine])

  const setSubOscLevel = useCallback((v: number) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, subOscLevel: v } }))
    audioEngine.setSubOscLevel(v)
  }, [audioEngine])

  const setSubOscOctave = useCallback((v: -1 | -2) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, subOscOctave: v } }))
    audioEngine.setSubOscOctave(v)
  }, [audioEngine])

  const setNoiseLevel = useCallback((v: number) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, noiseLevel: v } }))
    audioEngine.setNoiseLevel(v)
  }, [audioEngine])

  const setNoiseType = useCallback((v: NoiseType) => {
    setParams((p) => ({ ...p, oscillator: { ...p.oscillator, noiseType: v } }))
    audioEngine.setNoiseType(v)
  }, [audioEngine])

  const setGlideEnabled = useCallback((v: boolean) => {
    setParams((p) => ({ ...p, glide: { ...p.glide, enabled: v } }))
    audioEngine.setGlideEnabled(v)
  }, [audioEngine])

  const setGlideTime = useCallback((v: number) => {
    setParams((p) => ({ ...p, glide: { ...p.glide, time: v } }))
    audioEngine.setGlideTime(v)
  }, [audioEngine])

  const setPitchBend = useCallback((v: number) => {
    setPitchBendValue(v)
    audioEngine.setPitchBend(v)
  }, [audioEngine])

  const setPitchBendRange = useCallback((v: number) => {
    setParams((p) => ({ ...p, pitchBendRange: v }))
    audioEngine.setPitchBendRange(v)
  }, [audioEngine])

  const setLFORate = useCallback((v: number) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, rate: v } }))
    audioEngine.setLFORate(v)
  }, [audioEngine])

  const setLFODepth = useCallback((v: number) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, depth: v } }))
    audioEngine.setLFODepth(v)
  }, [audioEngine])

  const setLFOWaveform = useCallback((v: LFOWaveform) => {
    setParams((p) => ({ ...p, lfo: { ...p.lfo, waveform: v } }))
    audioEngine.setLFOWaveform(v)
  }, [audioEngine])

  const setModRouting = useCallback((target: ModulationTarget, amount: number, enabled: boolean) => {
    setParams((prev) => ({
      ...prev,
      modRouting: prev.modRouting.map((r) =>
        r.target === target ? { ...r, amount, enabled } : r
      ),
    }))
    audioEngine.setModRouting(target, amount, enabled)
  }, [audioEngine])

  const setLowpassFrequency = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, lowpass: { ...p.effects.lowpass, frequency: v } } }))
    audioEngine.setLowpassFrequency(v)
  }, [audioEngine])

  const setLowpassQ = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, lowpass: { ...p.effects.lowpass, Q: v } } }))
    audioEngine.setLowpassQ(v)
  }, [audioEngine])

  const setHighpassFrequency = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, highpass: { ...p.effects.highpass, frequency: v } } }))
    audioEngine.setHighpassFrequency(v)
  }, [audioEngine])

  const setHighpassQ = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, highpass: { ...p.effects.highpass, Q: v } } }))
    audioEngine.setHighpassQ(v)
  }, [audioEngine])

  const setFilterEnvAttack = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, attack: v } }))
    audioEngine.setFilterEnvAttack(v)
  }, [audioEngine])

  const setFilterEnvDecay = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, decay: v } }))
    audioEngine.setFilterEnvDecay(v)
  }, [audioEngine])

  const setFilterEnvSustain = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, sustain: v } }))
    audioEngine.setFilterEnvSustain(v)
  }, [audioEngine])

  const setFilterEnvRelease = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, release: v } }))
    audioEngine.setFilterEnvRelease(v)
  }, [audioEngine])

  const setFilterEnvAmount = useCallback((v: number) => {
    setParams((p) => ({ ...p, filterEnvelope: { ...p.filterEnvelope, amount: v } }))
    audioEngine.setFilterEnvAmount(v)
  }, [audioEngine])

  const setDistortionAmount = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, distortion: { ...p.effects.distortion, amount: v } } }))
    audioEngine.setDistortionAmount(v)
  }, [audioEngine])

  const setDistortionWet = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, distortion: { ...p.effects.distortion, wet: v } } }))
    audioEngine.setDistortionWet(v)
  }, [audioEngine])

  const setChorusRate = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, rate: v } }))
    audioEngine.setChorusRate(v)
  }, [audioEngine])

  const setChorusDepth = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, depth: v } }))
    audioEngine.setChorusDepth(v)
  }, [audioEngine])

  const setChorusWet = useCallback((v: number) => {
    setParams((p) => ({ ...p, chorus: { ...p.chorus, wet: v } }))
    audioEngine.setChorusWet(v)
  }, [audioEngine])

  const setPhaserRate = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, rate: v } }))
    audioEngine.setPhaserRate(v)
  }, [audioEngine])

  const setPhaserDepth = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, depth: v } }))
    audioEngine.setPhaserDepth(v)
  }, [audioEngine])

  const setPhaserWet = useCallback((v: number) => {
    setParams((p) => ({ ...p, phaser: { ...p.phaser, wet: v } }))
    audioEngine.setPhaserWet(v)
  }, [audioEngine])

  const setDelayTime = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, time: v } } }))
    audioEngine.setDelayTime(v)
  }, [audioEngine])

  const setDelayFeedback = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, feedback: v } } }))
    audioEngine.setDelayFeedback(v)
  }, [audioEngine])

  const setDelayWet = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, delay: { ...p.effects.delay, wet: v } } }))
    audioEngine.setDelayWet(v)
  }, [audioEngine])

  const setReverbDecay = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, reverb: { ...p.effects.reverb, decay: v } } }))
    audioEngine.setReverbDecay(v)
  }, [audioEngine])

  const setReverbWet = useCallback((v: number) => {
    setParams((p) => ({ ...p, effects: { ...p.effects, reverb: { ...p.effects.reverb, wet: v } } }))
    audioEngine.setReverbWet(v)
  }, [audioEngine])

  const setBpm = useCallback((v: number) => {
    setParams((p) => ({ ...p, tempo: { ...p.tempo, bpm: v } }))
    tempoHook.setBpm(v)
  }, [tempoHook])

  const setArpEnabled = useCallback((v: boolean) => {
    arpeggiatorHook.setEnabled(v)
    if (!v) arpeggiatorHook.clearNotes()
  }, [arpeggiatorHook])

  const setArpPattern = useCallback((v: ArpPattern) => {
    arpeggiatorHook.setPattern(v)
  }, [arpeggiatorHook])

  const setArpRate = useCallback((v: ArpRate) => {
    arpeggiatorHook.setRate(v)
  }, [arpeggiatorHook])

  const setArpOctaves = useCallback((v: 1 | 2 | 3) => {
    arpeggiatorHook.setOctaves(v)
  }, [arpeggiatorHook])

  const loadPreset = useCallback((id: string) => {
    const loadedParams = presetsHook.loadPreset(id)
    if (loadedParams) {
      setParams(loadedParams)
      syncParamsToEngine(loadedParams)
    }
    return loadedParams
  }, [presetsHook, syncParamsToEngine])

  const initPreset = useCallback(() => {
    const initParams = presetsHook.initPreset()
    setParams(initParams)
    syncParamsToEngine(initParams)
    return initParams
  }, [presetsHook, syncParamsToEngine])

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PRESET_PARAMS)
    syncParamsToEngine(DEFAULT_PRESET_PARAMS)
    setPitchBendValue(0)
    audioEngine.setPitchBend(0)
  }, [syncParamsToEngine, audioEngine])

  const getCurrentParams = useCallback((): SynthPresetParams => {
    return {
      ...params,
      arpeggiator: arpeggiatorHook.params,
      tempo: { bpm: tempoHook.bpm },
    }
  }, [params, arpeggiatorHook.params, tempoHook.bpm])

  const stateValue = useMemo<SynthStateContextValue>(() => ({
    params,
    pitchBendValue,
    activeKeys,
    isInitialized: audioEngine.isInitialized,
    isPlaying: audioEngine.isPlaying,
    tempo: {
      bpm: tempoHook.bpm,
      isPlaying: tempoHook.isPlaying,
    },
    arpeggiator: {
      params: arpeggiatorHook.params,
    },
    presets: {
      presets: presetsHook.presets,
      currentPresetId: presetsHook.currentPresetId,
    },
  }), [
    params,
    pitchBendValue,
    activeKeys,
    audioEngine.isInitialized,
    audioEngine.isPlaying,
    tempoHook.bpm,
    tempoHook.isPlaying,
    arpeggiatorHook.params,
    presetsHook.presets,
    presetsHook.currentPresetId,
  ])

  const actionsValue = useMemo<SynthActionsContextValue>(() => ({
    initializeAudio: audioEngine.initializeAudio,
    playNote,
    stopNote,
    handleNoteOn,
    handleNoteOff,
    handleOctaveChange,
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
    setModRouting,
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
    getMeterLevel: audioEngine.getMeterLevel,
    getWaveformData: audioEngine.getWaveformData,
    getFFTData: audioEngine.getFFTData,
    setBpm,
    tapTempo: tempoHook.tapTempo,
    toggleTransport: tempoHook.toggleTransport,
    startTransport: tempoHook.startTransport,
    stopTransport: tempoHook.stopTransport,
    getNoteTime: tempoHook.getNoteTime,
    setArpEnabled,
    setArpPattern,
    setArpRate,
    setArpOctaves,
    clearArpNotes: arpeggiatorHook.clearNotes,
    loadPreset,
    savePreset: presetsHook.savePreset,
    deletePreset: presetsHook.deletePreset,
    initPreset,
    isUserPreset: presetsHook.isUserPreset,
    handleReset,
    getCurrentParams,
  }), [
    audioEngine.initializeAudio,
    audioEngine.getMeterLevel,
    audioEngine.getWaveformData,
    audioEngine.getFFTData,
    playNote,
    stopNote,
    handleNoteOn,
    handleNoteOff,
    handleOctaveChange,
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
    setModRouting,
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
    setBpm,
    tempoHook.tapTempo,
    tempoHook.toggleTransport,
    tempoHook.startTransport,
    tempoHook.stopTransport,
    tempoHook.getNoteTime,
    setArpEnabled,
    setArpPattern,
    setArpRate,
    setArpOctaves,
    arpeggiatorHook.clearNotes,
    loadPreset,
    presetsHook.savePreset,
    presetsHook.deletePreset,
    initPreset,
    presetsHook.isUserPreset,
    handleReset,
    getCurrentParams,
  ])

  return (
    <SynthStateContext.Provider value={stateValue}>
      <SynthActionsContext.Provider value={actionsValue}>
        {children}
      </SynthActionsContext.Provider>
    </SynthStateContext.Provider>
  )
}
