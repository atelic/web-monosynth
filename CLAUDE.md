# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based polyphonic synthesizer built with React 18, TypeScript, and Tone.js. Features an Ableton-inspired dark theme UI with real-time audio effects, arpeggiator, and preset system.

## Commands

- `npm run dev` - Start Vite development server
- `npm run build` - TypeScript check and production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run deploy` - Build and deploy to GitHub Pages

**Note**: Requires Node 25.2.1 (use `source ~/.nvm/nvm.sh && nvm use` before running commands)

## Architecture

### Component Hierarchy

```
App.tsx
└── SynthProvider (context for all synth state)
    └── Synth.tsx (main container)
        ├── MasterModule (volume, attack, release, waveform, octave, mono)
        ├── OscillatorModule (sub osc, noise)
        ├── FilterModule (lowpass, highpass, filter envelope)
        ├── LFOModule (rate, depth, waveform, filter routing)
        ├── ChorusModule, PhaserModule, DistortionModule
        ├── DelayModule, ReverbModule
        ├── ArpeggiatorModule (pattern, rate, octaves)
        ├── TempoModule (BPM, tap tempo)
        ├── PitchModule (glide, pitch bend)
        ├── PresetManager (save/load/reset)
        ├── Keyboard (piano keyboard UI)
        ├── WaveformDisplay, SpectrumAnalyzer, VUMeter
        └── PitchWheel, ModWheel
```

### Audio System (Tone.js)

- **Signal chain**: `PolySynth + SubOsc + Noise → Mixer → Lowpass → Highpass → Distortion → Chorus → Phaser → Delay → Reverb → Master → Meter → Analyser → Destination`
- **Polyphony**: 4-voice PolySynth with optional mono mode (last-note priority)
- **Filter modulation**: Uses `Tone.Signal` for base frequency, allowing LFO and filter envelope to add modulation without interference
- **Arpeggiator**: Uses `Tone.Loop` for timing, synced to `Tone.Transport`
- Requires user interaction to start (`Tone.start()` on click)

### Key Files

```
src/
├── context/
│   └── SynthContext.tsx   # Central state management, connects all hooks
├── hooks/
│   ├── useAudioEngine.ts  # Core Tone.js audio (800+ lines)
│   ├── useArpeggiator.ts  # Arpeggiator with Tone.Loop
│   ├── useTempo.ts        # BPM, tap tempo, transport control
│   ├── usePresets.ts      # Preset save/load with localStorage
│   └── useKeyboard.ts     # Computer keyboard → notes
├── components/
│   ├── Modules/           # All synth parameter UI modules
│   ├── Controls/          # Knob, Slider, ToggleButton, etc.
│   └── Visualizers/       # Waveform, spectrum, VU meter
├── constants/
│   ├── factoryPresets.ts  # 10 built-in presets
│   └── frequencies.ts     # Note frequency mapping
└── types/
    └── synth.types.ts     # All TypeScript types and defaults
```

### Important Implementation Details

- **Filter frequency control**: `lowpassBaseFreqRef` (Tone.Signal) holds base frequency; LFO and envelope connect additively to `lowpassRef.current.frequency`
- **LFO routing**: Only supports filter cutoff modulation (pitch modulation removed)
- **Arpeggiator timing**: Uses Tone.js notation (e.g., "8n") via `getToneTime()` for tempo-synced playback
- **Preset migration**: `usePresets.ts` handles migrating old presets that may have removed fields (PWM, pitch LFO, tempo sync)

### Tech Stack

- **Build**: Vite
- **Language**: TypeScript (strict mode)
- **Framework**: React 18 (functional components with hooks)
- **Audio**: Tone.js
- **Styling**: Tailwind CSS with custom Ableton theme colors
- **Linting**: ESLint 9 with TypeScript and React hooks plugins
- **Formatting**: Prettier
