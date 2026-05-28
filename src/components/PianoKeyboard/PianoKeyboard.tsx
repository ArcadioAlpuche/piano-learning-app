import type { CSSProperties } from 'react'
import type { KeyboardRangeOption, NoteName } from '../../lib/musicTypes'
import { getKeyboardNotes, noteToComparableValue } from '../../lib/noteUtils'
import './PianoKeyboard.css'

interface PianoKeyboardProps {
  activeNotes: NoteName[]
  range: KeyboardRangeOption
  sequenceNotes: NoteName[]
  onPreviewNotes: (notes: NoteName[]) => void
}

export function PianoKeyboard({ activeNotes, range, sequenceNotes, onPreviewNotes }: PianoKeyboardProps) {
  const notes = getKeyboardNotes(range)
  const whiteNotes = notes.filter((note) => !note.isBlack)
  const blackNotes = notes.filter((note) => note.isBlack)
  const activeNoteSet = new Set(activeNotes.map(noteToComparableValue))
  const sequenceNoteSet = new Set(sequenceNotes.map(noteToComparableValue))

  const whiteIndexByMidi = new Map(whiteNotes.map((note, index) => [note.midi, index]))
  const keyboardStyle = { '--white-key-count': whiteNotes.length } as CSSProperties

  return (
    <section className="keyboard-shell" aria-label="Visual piano keyboard">
      <div className="keyboard-header">
        <h2>Piano Keyboard</h2>
        <div className="active-notes" aria-live="polite">
          {activeNotes.length > 0 ? activeNotes.join(' ') : 'No active note'}
        </div>
      </div>

      <div className="piano-keyboard" style={keyboardStyle}>
        <div className="white-keys">
          {whiteNotes.map((note) => (
            <button
              className={`piano-key white-key ${sequenceNoteSet.has(note.midi) ? 'upcoming' : ''} ${activeNoteSet.has(note.midi) ? 'active' : ''}`}
              key={note.note}
              onClick={() => onPreviewNotes([note.note])}
              type="button"
            >
              <span>{note.note}</span>
            </button>
          ))}
        </div>

        {blackNotes.map((note) => {
          const previousWhiteIndex = whiteIndexByMidi.get(note.midi - 1) ?? 0

          return (
            <button
              className={`piano-key black-key ${sequenceNoteSet.has(note.midi) ? 'upcoming' : ''} ${activeNoteSet.has(note.midi) ? 'active' : ''}`}
              key={note.note}
              onClick={() => onPreviewNotes([note.note])}
              style={{ '--black-key-left': previousWhiteIndex + 1 } as CSSProperties}
              type="button"
            >
              <span>{activeNoteSet.has(note.midi) ? note.note : note.pitchClass}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
