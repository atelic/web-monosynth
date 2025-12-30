# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based monophonic synthesizer built with React 18, TypeScript, and Tone.js. Features an Ableton-inspired dark theme UI with real-time audio effects including filters, reverb, delay, and distortion.

## Commands

- `npm run dev` - Start Vite development server
- `npm run build` - TypeScript check and production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run deploy` - Build and deploy to GitHub Pages

## Architecture

### Component Hierarchy

```
App.tsx
└── Synth.tsx (main container with state management)
    ├── MasterModule (volume, attack, release, waveform, octave)
    ├── FilterModule (lowpass, highpass with frequency and Q)
    ├── ReverbModule (decay, wet)
    ├── DelayModule (time, feedback, wet)
    ├── DistortionModule (amount, wet)
    ├── Keyboard (piano keyboard UI)
    │   └── Key (individual key, x15)
    ├── WaveformDisplay (oscilloscope visualization)
    └── VUMeter (level meter)
```

### Audio System (Tone.js)

- Signal chain: `MonoSynth → Lowpass → Highpass → Distortion → Delay → Reverb → Meter → Analyser → Destination`
- Audio engine encapsulated in `useAudioEngine` hook with parameter setters using `rampTo()` for smooth transitions
- Requires user interaction to start (`Tone.start()` on click)
- Keyboard keys A-L are white keys, W/E/T/Y/U/O are black keys
- Z/X keys change octave (0-5 range)

### Key Directories

```
src/
├── components/
│   ├── Synth/      # Main container component
│   ├── Keyboard/   # Piano keyboard UI
│   ├── Controls/   # Knob, Slider, WaveformSelector, OctaveDisplay
│   ├── Modules/    # Effect module panels (Master, Filter, Reverb, etc.)
│   ├── Visualizers/# VUMeter, WaveformDisplay
│   └── Layout/     # ModulePanel wrapper
├── hooks/
│   ├── useAudioEngine.ts  # Core Tone.js audio logic
│   ├── useKeyboard.ts     # Keyboard event handling
│   └── useAnimationFrame.ts # For visualizers
├── constants/
│   └── frequencies.ts     # Note frequency mapping
└── types/
    └── synth.types.ts     # TypeScript type definitions
```

### Tech Stack

- **Build**: Vite
- **Language**: TypeScript (strict mode)
- **Framework**: React 18 (functional components with hooks)
- **Audio**: Tone.js
- **Styling**: Tailwind CSS with custom Ableton theme colors
- **Linting**: ESLint 9 with TypeScript and React hooks plugins
- **Formatting**: Prettier
