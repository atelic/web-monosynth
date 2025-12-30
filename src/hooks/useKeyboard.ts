import { useEffect, useCallback, useRef } from 'react'
import { NOTE_KEY_CODES } from '../constants/frequencies'

interface UseKeyboardOptions {
  onNoteOn: (code: string) => void
  onNoteOff: (code: string) => void
  onOctaveChange: (direction: 'up' | 'down') => void
  enabled?: boolean
}

export function useKeyboard({
  onNoteOn,
  onNoteOff,
  onOctaveChange,
  enabled = true,
}: UseKeyboardOptions) {
  const activeKeysRef = useRef<Set<string>>(new Set())

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return
      if (e.repeat) return

      // Prevent default for synth keys to avoid browser shortcuts
      if (NOTE_KEY_CODES.has(e.code) || e.code === 'KeyZ' || e.code === 'KeyX') {
        e.preventDefault()
      }

      if (e.code === 'KeyZ') {
        onOctaveChange('down')
        return
      }

      if (e.code === 'KeyX') {
        onOctaveChange('up')
        return
      }

      if (NOTE_KEY_CODES.has(e.code) && !activeKeysRef.current.has(e.code)) {
        activeKeysRef.current.add(e.code)
        onNoteOn(e.code)
      }
    },
    [enabled, onNoteOn, onOctaveChange]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      if (NOTE_KEY_CODES.has(e.code)) {
        activeKeysRef.current.delete(e.code)
        onNoteOff(e.code)
      }
    },
    [enabled, onNoteOff]
  )

  // Handle window blur to release all keys
  const handleBlur = useCallback(() => {
    activeKeysRef.current.forEach((code) => {
      onNoteOff(code)
    })
    activeKeysRef.current.clear()
  }, [onNoteOff])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur])

  return {
    activeKeys: activeKeysRef.current,
  }
}
