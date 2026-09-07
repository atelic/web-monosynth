// Run npm run dev, then open /web-polysynth/tests/regression.html.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { useKeyboard } from '../src/hooks/useKeyboard'
import { DEFAULT_PRESET_PARAMS, usePresets } from '../src/hooks/usePresets'

const storageKey = 'web-monosynth-presets'
const original = localStorage.getItem(storageKey)
const root = createRoot(document.getElementById('root')!)
const notes: string[] = []
let presets: ReturnType<typeof usePresets>

export function Harness() {
  presets = usePresets()
  useKeyboard({
    onNoteOn: (code) => notes.push(`on:${code}`),
    onNoteOff: (code) => notes.push(`off:${code}`),
    onOctaveChange: (direction) => notes.push(direction),
  })
  return <input aria-label="Preset name" />
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function key(target: EventTarget, type: string, code: string, options = {}) {
  const event = new KeyboardEvent(type, { code, bubbles: true, cancelable: true, ...options })
  target.dispatchEvent(event)
  return event
}

try {
  const saved = {
    id: 'user-check',
    name: 'Saved patch',
    category: 'user',
    params: DEFAULT_PRESET_PARAMS,
  }
  localStorage.setItem(storageKey, JSON.stringify([saved]))
  flushSync(() =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>
    )
  )
  assert(presets!.userPresets.length === 1, 'StrictMode must retain saved presets')
  assert(JSON.parse(localStorage.getItem(storageKey)!).length === 1, 'Mount must not erase storage')

  const input = document.querySelector('input')!
  assert(!key(input, 'keydown', 'KeyA').defaultPrevented, 'Typing must not be intercepted')
  key(input, 'keyup', 'KeyA')
  key(input, 'keydown', 'KeyZ')
  key(window, 'keydown', 'KeyA', { metaKey: true })
  key(window, 'keyup', 'KeyA')
  assert(notes.length === 0, 'Typing and browser shortcuts must not play notes or change octave')

  key(window, 'keydown', 'KeyA')
  key(window, 'keydown', 'KeyA', { repeat: true })
  key(input, 'keyup', 'KeyA')
  assert(notes.join(',') === 'on:KeyA,off:KeyA', 'A held note must release even after focus moves')
  notes.length = 0
  key(window, 'keydown', 'KeyS')
  window.dispatchEvent(new Event('blur'))
  assert(notes.join(',') === 'on:KeyS,off:KeyS', 'Blur must release held notes')

  flushSync(() => presets!.savePreset('New patch', 'user', DEFAULT_PRESET_PARAMS))
  assert(
    JSON.parse(localStorage.getItem(storageKey)!).length === 2,
    'Saving must persist both presets'
  )
  const id = presets!.currentPresetId!
  flushSync(() => presets!.deletePreset(id))
  assert(
    JSON.parse(localStorage.getItem(storageKey)!).length === 1,
    'Deleting must preserve other presets'
  )
  document.getElementById('result')!.textContent =
    'PASS: preset persistence, typing, shortcuts, note release, and blur'
} catch (error) {
  document.getElementById('result')!.textContent = `FAIL: ${error}`
  throw error
} finally {
  root.unmount()
  if (original === null) localStorage.removeItem(storageKey)
  else localStorage.setItem(storageKey, original)
}
