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
      className={`rounded-lg border border-ableton-border bg-ableton-surface p-2 shadow-module md:p-3 ${className}`}
    >
      <div className="overflow-x-auto rounded-md border border-ableton-border-light/60 bg-ableton-bg p-1.5 shadow-[inset_0_1px_16px_rgba(0,0,0,0.28)]">
        <div className="relative min-w-[640px] md:min-w-0">
          {/* White keys */}
          <div className="grid grid-cols-9 gap-1">
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
          <div className="pointer-events-none absolute left-1.5 right-1.5 top-1.5 grid grid-cols-9 gap-1">
            {whiteKeys.map((_, index) => {
              const blackKey = blackKeys.find((bk) => blackKeyPositions[bk.code] === index)
              if (!blackKey) {
              return <div key={`spacer-${index}`} className="h-16" />
            }
            return (
              <div key={blackKey.code} className="pointer-events-none relative h-16">
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
      </div>

      <p className="mt-2 text-center font-mono text-[10px] text-ableton-text-muted">
        A-L play naturals / W E T Y U O play sharps
      </p>
    </div>
  )
}
