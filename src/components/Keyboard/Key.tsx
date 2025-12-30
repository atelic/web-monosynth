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

  if (isBlack) {
    return (
      <button
        className={`
          relative z-10 h-16 -mx-2 flex flex-col items-center justify-end pb-1
          rounded-b-md transition-all duration-75
          ${
            isActive
              ? 'bg-ableton-accent shadow-key-active'
              : 'bg-gradient-to-b from-gray-700 to-ableton-key-black hover:from-gray-600 hover:to-gray-800'
          }
          border border-gray-600
        `}
        onMouseDown={onNoteOn}
        onMouseUp={onNoteOff}
        onMouseLeave={onNoteOff}
      >
        <span
          className={`text-[10px] font-mono ${isActive ? 'text-white' : 'text-ableton-text-muted'}`}
        >
          {keyLabel}
        </span>
      </button>
    )
  }

  return (
    <button
      className={`
        relative h-24 flex flex-col items-center justify-end pb-2
        rounded-b-md transition-all duration-75
        ${
          isActive
            ? 'bg-ableton-accent shadow-key-active'
            : 'bg-gradient-to-b from-ableton-key-white to-gray-200 hover:from-gray-100 hover:to-gray-300'
        }
        border border-gray-300
      `}
      onMouseDown={onNoteOn}
      onMouseUp={onNoteOff}
      onMouseLeave={onNoteOff}
    >
      <span
        className={`text-xs font-mono ${isActive ? 'text-white' : 'text-ableton-text-muted'} mb-1`}
      >
        {noteName}
      </span>
      <span
        className={`text-[10px] font-mono ${isActive ? 'text-white/70' : 'text-ableton-text-muted/50'}`}
      >
        {keyLabel}
      </span>
    </button>
  )
}
