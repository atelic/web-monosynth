# Code Review - Improvements & Recommendations

Date: January 7, 2026

## Bugs Fixed

### 1. Filter Envelope Not Working
**File:** `src/hooks/useAudioEngine.ts:154`

**Problem:** The filter envelope scale was initialized with `max: 5000` regardless of the UI "Amount" setting. Even when Amount was 0, the envelope added up to 5kHz of cutoff movement, making the filter appear stuck or unresponsive.

**Fix:**
```typescript
// Before
filterEnvScaleRef.current = new Tone.Scale(0, 5000)

// After
filterEnvScaleRef.current = new Tone.Scale(0, DEFAULT_FILTER_ENVELOPE_PARAMS.amount * 8000)
```

### 2. Arpeggiator Silent
**File:** `src/hooks/useArpeggiator.ts:129`

**Problem:** `loopRef.current.start(0)` schedules the loop at transport time 0. If the transport was already running (position > 0), the loop would be scheduled in the past and never fire.

**Fix:**
```typescript
// Before
loopRef.current.start(0)

// After
loopRef.current.start('+0')
```

### 3. LFO Has No Effect
**File:** `src/hooks/useAudioEngine.ts:644-655`

**Problem:** LFO modulation range was calculated from the current cutoff value at the moment routing was set. Moving the cutoff afterwards didn't update the range, leading to inaudible or unpredictable modulation.

**Fix:**
```typescript
// Before
const baseFreq = lowpassBaseFreqRef.current.value as number
const modulationRange = Math.min(baseFreq * 0.8, 8000)
lfoToFilterRef.current.gain.rampTo(scaledAmount * modulationRange, 0.1)

// After
const LFO_FILTER_MAX_RANGE = 5000
lfoToFilterRef.current.gain.rampTo(scaledAmount * LFO_FILTER_MAX_RANGE, 0.1)
```

### 4. Arpeggiator Cleanup Missing
**File:** `src/hooks/useArpeggiator.ts:235-242`

**Problem:** Unmount cleanup didn't call `setArpeggiating(false)`, potentially leaving audio engine in wrong state.

**Fix:** Added `setArpeggiatingRef.current(false)` to cleanup effect.

### 5. ESLint React Refresh Warning
**File:** `src/context/SynthContext.tsx`

**Problem:** React Refresh warning because context creation and provider component were exported from same file.

**Fix:** Created `src/context/SynthContextType.ts` to hold context creation and type definition separately from the provider component.

---

## Future Improvements (Not Yet Implemented)

### High Priority

#### 1. Split Context into State + Actions
**Current:** `SynthContext` is a "god provider" with 40+ callbacks, state, presets, tempo, arpeggiator, and audio engine all in one.

**Recommended:**
```typescript
// SynthStateContext - values that change frequently
interface SynthStateContextValue {
  params: SynthPresetParams
  pitchBendValue: number
  activeKeys: Set<string>
  isInitialized: boolean
  isPlaying: boolean
}

// SynthActionsContext - stable callbacks (memoized once)
interface SynthActionsContextValue {
  initializeAudio: () => Promise<void>
  playNote: (frequency: number) => void
  stopNote: (frequency: number) => void
  setLowpassFrequency: (frequency: number) => void
  // ... all setters
}
```

**Benefits:**
- Components that only need actions won't re-render when state changes
- Easier to test and maintain
- Better separation of concerns

#### 2. Consolidate Handler Duplication in Synth.tsx
**Current:** `Synth.tsx` creates 40+ memoized handlers that duplicate "update state + call engine setter" pattern:

```typescript
const handleVolumeChange = useCallback((v: number) => {
  setParams((p) => ({ ...p, master: { ...p.master, volume: v } }))
  setVolume(v)
}, [setParams, setVolume])
```

**Recommended:** Move this logic into the provider so modules call one function:

```typescript
// In SynthProvider
const setVolumeWithState = useCallback((v: number) => {
  setParams((p) => ({ ...p, master: { ...p.master, volume: v } }))
  audioEngine.setVolume(v)
}, [])

// In Synth.tsx - just wire it up
<MasterModule onVolumeChange={synth.setVolumeWithState} />
```

#### 3. Transport Ownership
**Current:** Both `useTempo` and `useArpeggiator` manipulate `Tone.Transport` and track state separately.

**Recommended:** Pick one owner (tempo) and have arpeggiator request start/stop through it:

```typescript
// useTempo owns Transport
const tempoHook = useTempo()

// useArpeggiator requests transport control
const arpeggiatorHook = useArpeggiator({
  requestTransportStart: tempoHook.startTransport,
  requestTransportStop: tempoHook.stopTransport,
  // ...
})
```

### Medium Priority

#### 4. Convert State to Refs Where Appropriate
**Current:** `activeKeyFrequencies` is React state but only used for event bookkeeping.

**Recommended:** Use refs for values only needed in event handlers:
```typescript
// Before
const [activeKeyFrequencies, setActiveKeyFrequencies] = useState<Map<string, number>>(new Map())

// After
const activeKeyFrequenciesRef = useRef<Map<string, number>>(new Map())
```

**Benefits:** Eliminates unnecessary re-renders.

#### 5. Memoize Context Value
**Current:** Context value object is recreated every render.

**Recommended:**
```typescript
const value = useMemo(() => ({
  // ... all context properties
}), [/* stable dependencies */])
```

**Caveat:** With 40+ properties, the dependency array is large. Splitting context (recommendation #1) makes this more practical.

#### 6. Add Error Boundaries for Audio
**Current:** `AudioErrorBoundary.tsx` exists but usage could be expanded.

**Recommended:** Wrap audio-dependent components more granularly to prevent full app crashes from Web Audio issues.

### Low Priority

#### 7. Extract Magic Numbers to Constants
Various magic numbers in the codebase:
- `4` voices in PolySynth
- `8000` Hz max filter envelope sweep
- `5000` Hz LFO filter range
- `150` px drag sensitivity for knobs

**Recommended:** Create `src/constants/audio.ts`:
```typescript
export const POLY_VOICE_COUNT = 4
export const FILTER_ENV_MAX_SWEEP_HZ = 8000
export const LFO_FILTER_MAX_RANGE_HZ = 5000
export const KNOB_DRAG_SENSITIVITY_PX = 150
```

#### 8. Add TypeScript Strict Null Checks for Refs
Many patterns like:
```typescript
if (!polySynthRef.current) return
```

Consider using assertion functions or stricter initialization patterns.

#### 9. Consider Web Worker for Audio Analysis
Visualizers (`WaveformDisplay`, `SpectrumAnalyzer`, `VUMeter`) use `requestAnimationFrame` on the main thread.

For smoother UI, consider offloading FFT analysis to a Web Worker.

---

## Testing Recommendations

1. **Manual Testing Required:**
   - Verify arpeggiator produces sound when enabled
   - Verify lowpass filter cutoff audibly affects sound
   - Verify LFO modulation is audible when routed to filter
   - Test preset loading/saving after fixes
   - Test mono mode with arpeggiator

2. **Automated Testing (Future):**
   - Unit tests for `useAudioEngine` callbacks
   - Integration tests for arpeggiator timing
   - Snapshot tests for factory presets

---

## Performance Notes

- Build size: 486KB JS (132KB gzipped) - reasonable for Tone.js inclusion
- CSS: 23KB (4.8KB gzipped)
- Consider code splitting for effects modules if bundle grows
