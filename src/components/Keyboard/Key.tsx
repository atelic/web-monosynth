import { useRef, useCallback } from 'react'
import { NoteName } from '../../types/synth.types'

interface KeyProps {
  noteName: NoteName
  keyCode: string
  isBlack: boolean
  isActive: boolean
  onNoteOn: () => void
  onNoteOff: () => void
}

export function Key({ noteName, keyCode, isBlack, isActive, onNoteOn, onNoteOff }: KeyProps) {
  const keyLabel = keyCode.replace('Key', '')
  const isTriggeredRef = useRef(false)

  // Only trigger note-on once, and track state to prevent duplicate note-offs
  const handleNoteOn = useCallback(() => {
    if (!isTriggeredRef.current) {
      isTriggeredRef.current = true
      onNoteOn()
    }
  }, [onNoteOn])

  const handleNoteOff = useCallback(() => {
    if (isTriggeredRef.current) {
      isTriggeredRef.current = false
      onNoteOff()
    }
  }, [onNoteOff])

  if (isBlack) {
    return (
      <button
        type="button"
        aria-label={`${noteName}, computer key ${keyLabel}`}
        className={`
          pointer-events-auto absolute right-0 top-0 z-10 flex h-14 w-8 translate-x-1/2 flex-col items-center justify-end pb-1
          rounded-b transition-all duration-100 touch-none select-none
          ${
            isActive
              ? 'bg-ableton-accent shadow-key-active'
              : 'bg-gradient-to-b from-ableton-surface-light to-ableton-key-black hover:from-ableton-border hover:to-ableton-key-black-hover'
          }
          border border-ableton-border-light
        `}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          handleNoteOn()
        }}
        onPointerUp={handleNoteOff}
        onPointerCancel={handleNoteOff}
        onLostPointerCapture={handleNoteOff}
      >
        <span
          className={`font-mono text-[10px] ${isActive ? 'text-ableton-bg' : 'text-ableton-text-muted'}`}
        >
          {keyLabel}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={`${noteName}, computer key ${keyLabel}`}
      className={`
        flex h-full min-h-20 w-full flex-col items-center justify-end pb-2 md:min-h-24
        rounded-b transition-all duration-100 touch-none select-none
        ${
          isActive
            ? 'bg-ableton-accent shadow-key-active'
            : 'bg-gradient-to-b from-ableton-key-white via-[#dfd0b5] to-[#c1ad88] hover:from-ableton-key-white-hover hover:to-[#d6c19b]'
        }
        border border-[#9c875f] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
      `}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        handleNoteOn()
      }}
      onPointerUp={handleNoteOff}
      onPointerCancel={handleNoteOff}
      onLostPointerCapture={handleNoteOff}
    >
      <span
        className={`mb-1 font-mono text-xs ${isActive ? 'text-ableton-bg' : 'text-ableton-bg/70'}`}
      >
        {noteName}
      </span>
      <span
        className={`font-mono text-[10px] ${isActive ? 'text-ableton-bg/70' : 'text-ableton-bg/45'}`}
      >
        {keyLabel}
      </span>
    </button>
  )
}
