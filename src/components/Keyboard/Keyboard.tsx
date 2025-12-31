import { Key } from './Key'
import { KEY_MAPPING } from '../../constants/frequencies'

interface KeyboardProps {
  activeKeys: Set<string>
  onNoteOn: (code: string) => void
  onNoteOff: (code: string) => void
  className?: string
}

export function Keyboard({ activeKeys, onNoteOn, onNoteOff, className = '' }: KeyboardProps) {
  // Separate white and black keys for layout
  const whiteKeys = KEY_MAPPING.filter((k) => !k.isBlack)
  const blackKeys = KEY_MAPPING.filter((k) => k.isBlack)

  // Map black keys to their positions relative to white keys
  const blackKeyPositions: Record<string, number> = {
    KeyW: 0, // Between C and D (position 0-1)
    KeyE: 1, // Between D and E (position 1-2)
    KeyT: 3, // Between F and G (position 3-4)
    KeyY: 4, // Between G and A (position 4-5)
    KeyU: 5, // Between A and B (position 5-6)
    KeyO: 7, // Between C and D (octave 2)
  }

  return (
    <div
      className={`bg-ableton-surface border border-ableton-border rounded-lg p-4 ${className}`}
    >
      <div className="relative">
        {/* White keys */}
        <div className="grid grid-cols-9 gap-0.5">
          {whiteKeys.map((key) => (
            <Key
              key={key.code}
              noteName={key.noteName}
              keyCode={key.code}
              isBlack={false}
              isActive={activeKeys.has(key.code)}
              onNoteOn={() => onNoteOn(key.code)}
              onNoteOff={() => onNoteOff(key.code)}
            />
          ))}
        </div>

        {/* Black keys overlay */}
        <div className="absolute top-0 left-0 right-0 grid grid-cols-9 gap-0.5 pointer-events-none">
          {whiteKeys.map((_, index) => {
            const blackKey = blackKeys.find((bk) => blackKeyPositions[bk.code] === index)
            if (!blackKey) {
              return <div key={`spacer-${index}`} className="h-16" />
            }
            return (
              <div key={blackKey.code} className="pointer-events-auto px-1">
                <Key
                  noteName={blackKey.noteName}
                  keyCode={blackKey.code}
                  isBlack={true}
                  isActive={activeKeys.has(blackKey.code)}
                  onNoteOn={() => onNoteOn(blackKey.code)}
                  onNoteOff={() => onNoteOff(blackKey.code)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-ableton-text-muted mt-3 font-mono">
        Use keyboard keys A-L (white) and W, E, T, Y, U, O (black) to play
      </p>
    </div>
  )
}
