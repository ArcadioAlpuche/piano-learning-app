import type { LessonCategory, MusicalSequence } from '../lib/musicTypes'

const cMajorScale: MusicalSequence = {
  id: 'c-major-scale',
  title: 'C Major Scale',
  kind: 'scale',
  defaultTempo: 84,
  clef: 'treble',
  events: [
    { id: 'c4-up', notes: ['C4'], durationBeats: 1, label: 'C4', fingering: ['1'], metadata: { scaleDegree: 1 } },
    { id: 'd4-up', notes: ['D4'], durationBeats: 1, label: 'D4', fingering: ['2'], metadata: { scaleDegree: 2 } },
    { id: 'e4-up', notes: ['E4'], durationBeats: 1, label: 'E4', fingering: ['3'], metadata: { scaleDegree: 3 } },
    { id: 'f4-up', notes: ['F4'], durationBeats: 1, label: 'F4', fingering: ['1'], metadata: { scaleDegree: 4 } },
    { id: 'g4-up', notes: ['G4'], durationBeats: 1, label: 'G4', fingering: ['2'], metadata: { scaleDegree: 5 } },
    { id: 'a4-up', notes: ['A4'], durationBeats: 1, label: 'A4', fingering: ['3'], metadata: { scaleDegree: 6 } },
    { id: 'b4-up', notes: ['B4'], durationBeats: 1, label: 'B4', fingering: ['4'], metadata: { scaleDegree: 7 } },
    { id: 'c5-top', notes: ['C5'], durationBeats: 2, label: 'C5', fingering: ['5'], metadata: { scaleDegree: 1 } },
  ],
}

const cMajorChord: MusicalSequence = {
  id: 'c-major-chord',
  title: 'C Major Chord',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'c-major-root',
      notes: ['C4', 'E4', 'G4'],
      durationBeats: 4,
      label: 'C Major - C E G',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'C Major' },
    },
  ],
}

const aMinorChord: MusicalSequence = {
  id: 'a-minor-chord',
  title: 'A Minor Chord',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'a-minor-root',
      notes: ['A4', 'C5', 'E5'],
      durationBeats: 4,
      label: 'A Minor - A C E',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'A Minor' },
    },
  ],
}

const maryHadALittleLamb: MusicalSequence = {
  id: 'mary-had-a-little-lamb',
  title: 'Mary Had a Little Lamb',
  kind: 'melody',
  defaultTempo: 96,
  clef: 'treble',
  events: [
    { id: 'mary-1', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-2', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-3', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'mary-4', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-5', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-6', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-7', notes: ['E4'], durationBeats: 2, label: 'E4' },
    { id: 'mary-8', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-9', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-10', notes: ['D4'], durationBeats: 2, label: 'D4' },
    { id: 'mary-11', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-12', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'mary-13', notes: ['G4'], durationBeats: 2, label: 'G4' },
    { id: 'mary-14', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-15', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-16', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'mary-17', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-18', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-19', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-20', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-21', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-22', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-23', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-24', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mary-25', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'mary-26', notes: ['C4'], durationBeats: 4, label: 'C4' },
  ],
}

export const lessonCategories: LessonCategory[] = [
  {
    id: 'scales',
    label: 'Scales',
    items: [cMajorScale],
  },
  {
    id: 'chords',
    label: 'Chords',
    items: [cMajorChord, aMinorChord],
  },
  {
    id: 'songs',
    label: 'Songs',
    items: [maryHadALittleLamb],
  },
]

export const sequences = lessonCategories.flatMap((category) => category.items)
