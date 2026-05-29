import type { KeyboardRangeOption, MusicalEvent, MusicalSequence, NoteName } from './musicTypes'

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const SEMITONE_TO_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_NOTES = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])

export interface KeyboardNote {
  note: NoteName
  midi: number
  isBlack: boolean
  octave: number
  pitchClass: string
}

export function parseNote(note: NoteName) {
  const match = note.match(/^([A-G](?:#|b)?)(-?\d)$/)

  if (!match) {
    throw new Error(`Invalid note name: ${note}`)
  }

  return {
    pitchClass: match[1],
    octave: Number(match[2]),
  }
}

export function noteToMidi(note: NoteName) {
  const { pitchClass, octave } = parseNote(note)
  return (octave + 1) * 12 + NOTE_TO_SEMITONE[pitchClass]
}

export function noteToComparableValue(note: NoteName) {
  return noteToMidi(note)
}

export function midiToNote(midi: number): NoteName {
  const pitchClass = SEMITONE_TO_SHARP[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${pitchClass}${octave}`
}

export function getKeyboardNotes(range: KeyboardRangeOption): KeyboardNote[] {
  const start = noteToMidi('C4')
  const end = range === 'one-octave' ? noteToMidi('B4') : noteToMidi('B5')

  return Array.from({ length: end - start + 1 }, (_, index) => {
    const note = midiToNote(start + index)
    const { pitchClass, octave } = parseNote(note)

    return {
      note,
      midi: start + index,
      isBlack: BLACK_NOTES.has(pitchClass),
      octave,
      pitchClass,
    }
  })
}

export function formatEventNotes(event: MusicalEvent) {
  return event.notes.join(' ')
}

export function formatBeatCount(durationBeats: number) {
  const value = Number.isInteger(durationBeats) ? String(durationBeats) : String(durationBeats)

  return `${value} ${durationBeats === 1 ? 'beat' : 'beats'}`
}

export function formatCurrentEventDuration(event: MusicalEvent) {
  if (event.durationBeats === 1) {
    return `Beat 1 of ${event.durationBeats}`
  }

  return `Hold ${formatBeatCount(event.durationBeats)}`
}

export function formatSequenceDurationSummary(sequence: MusicalSequence) {
  const uniqueDurations = Array.from(new Set(sequence.events.map((event) => event.durationBeats)))
  const eventNoun = sequence.kind === 'chord' ? 'chord' : sequence.kind === 'scale' ? 'note' : 'event'

  if (uniqueDurations.length !== 1) {
    return 'Mixed durations'
  }

  const duration = uniqueDurations[0]

  if (sequence.events.length === 1) {
    return `Hold for ${formatBeatCount(duration)}`
  }

  return `Each ${eventNoun}: ${formatBeatCount(duration)}`
}

export function noteToVexKey(note: NoteName) {
  const { pitchClass, octave } = parseNote(note)
  return `${pitchClass.toLowerCase()}/${octave}`
}

export function beatsToVexDuration(durationBeats: number) {
  if (durationBeats >= 4) return 'w'
  if (durationBeats >= 2) return 'h'
  if (durationBeats >= 1) return 'q'
  return '8'
}
