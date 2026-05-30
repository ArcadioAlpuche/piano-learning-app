import type { LessonCategory, MusicalSequence, NoteName } from '../lib/musicTypes'

const CHORD_MEASURE_BEATS = 4

interface ScaleDefinition {
  id: string
  title: string
  notes: NoteName[]
  summary: string
  defaultTempo?: number
}

function makeScale({ defaultTempo = 84, id, notes, summary, title }: ScaleDefinition): MusicalSequence {
  return {
    id,
    title,
    summary,
    kind: 'scale',
    defaultTempo,
    clef: 'treble',
    events: notes.map((note, index) => ({
      id: `${id}-${index + 1}`,
      notes: [note],
      durationBeats: 1,
      label: note,
      metadata: { scaleDegree: index + 1 },
    })),
  }
}

const cMajorScale = makeScale({
  id: 'c-major-scale',
  title: 'C Major',
  summary: 'Beginner - No sharps/flats',
  notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
})

const gMajorScale = makeScale({
  id: 'g-major-scale',
  title: 'G Major',
  summary: 'Beginner - 1 sharp',
  notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
})

const fMajorScale = makeScale({
  id: 'f-major-scale',
  title: 'F Major',
  summary: 'Beginner - 1 flat',
  notes: ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5'],
})

const aNaturalMinorScale = makeScale({
  id: 'a-natural-minor-scale',
  title: 'A Natural Minor',
  summary: 'Beginner - No sharps/flats',
  notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
})

const eNaturalMinorScale = makeScale({
  id: 'e-natural-minor-scale',
  title: 'E Natural Minor',
  summary: 'Beginner - 1 sharp',
  notes: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
})

const dNaturalMinorScale = makeScale({
  id: 'd-natural-minor-scale',
  title: 'D Natural Minor',
  summary: 'Beginner - 1 flat',
  notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
})

const cMajorPentatonicScale = makeScale({
  id: 'c-major-pentatonic-scale',
  title: 'C Major Pentatonic',
  summary: 'Pentatonic - 5 notes',
  notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
})

const aMinorPentatonicScale = makeScale({
  id: 'a-minor-pentatonic-scale',
  title: 'A Minor Pentatonic',
  summary: 'Pentatonic - 5 notes',
  notes: ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'],
})

const gMajorPentatonicScale = makeScale({
  id: 'g-major-pentatonic-scale',
  title: 'G Major Pentatonic',
  summary: 'Pentatonic - 5 notes',
  notes: ['G4', 'A4', 'B4', 'D5', 'E5', 'G5'],
})

const eMinorPentatonicScale = makeScale({
  id: 'e-minor-pentatonic-scale',
  title: 'E Minor Pentatonic',
  summary: 'Pentatonic - 5 notes',
  notes: ['E4', 'G4', 'A4', 'B4', 'D5', 'E5'],
})

const aBluesScale = makeScale({
  id: 'a-blues-scale',
  title: 'A Blues',
  summary: 'Blues - Minor blues scale',
  notes: ['A4', 'C5', 'D5', 'D#5', 'E5', 'G5', 'A5'],
})

const eBluesScale = makeScale({
  id: 'e-blues-scale',
  title: 'E Blues',
  summary: 'Blues - Minor blues scale',
  notes: ['E4', 'G4', 'A4', 'A#4', 'B4', 'D5', 'E5'],
})

const cChromaticScale = makeScale({
  id: 'c-chromatic-scale',
  title: 'C Chromatic',
  summary: 'Chromatic - 12 half steps',
  notes: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'],
})

const cMajorChord: MusicalSequence = {
  id: 'c-major-chord',
  title: 'C Major Root Position',
  summary: 'Major triad - Root position',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'c-major-root',
      notes: ['C4', 'E4', 'G4'],
      durationBeats: CHORD_MEASURE_BEATS,
      label: 'C Major - C E G',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'C Major' },
    },
  ],
}

const aMinorChord: MusicalSequence = {
  id: 'a-minor-chord',
  title: 'A Minor Root Position',
  summary: 'Minor triad - Root position',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'a-minor-root',
      notes: ['A4', 'C5', 'E5'],
      durationBeats: CHORD_MEASURE_BEATS,
      label: 'A Minor - A C E',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'A Minor' },
    },
  ],
}

const fMajorChord: MusicalSequence = {
  id: 'f-major-chord',
  title: 'F Major Root Position',
  summary: 'Major triad - Root position',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'f-major-root',
      notes: ['F4', 'A4', 'C5'],
      durationBeats: CHORD_MEASURE_BEATS,
      label: 'F Major - F A C',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'F Major' },
    },
  ],
}

const gMajorChord: MusicalSequence = {
  id: 'g-major-chord',
  title: 'G Major Root Position',
  summary: 'Major triad - Root position',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    {
      id: 'g-major-root',
      notes: ['G4', 'B4', 'D5'],
      durationBeats: CHORD_MEASURE_BEATS,
      label: 'G Major - G B D',
      fingering: ['1', '3', '5'],
      metadata: { chordName: 'G Major' },
    },
  ],
}

const simpleChordMovement: MusicalSequence = {
  id: 'simple-chord-movement',
  title: 'Simple Chord Movement',
  summary: 'C - G - F - C',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    { id: 'simple-move-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'simple-move-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'simple-move-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'simple-move-c-return', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
  ],
}

const cMajorCadenceProgression: MusicalSequence = {
  id: 'c-major-cadence-progression',
  title: 'I-IV-V in C',
  summary: 'C - F - G - C',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    { id: 'cadence-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'cadence-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'cadence-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'cadence-c-return', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
  ],
}

const emotionalMovementProgression: MusicalSequence = {
  id: 'emotional-movement-c',
  title: 'Emotional Movement',
  summary: 'Am - F - C - G',
  kind: 'chord',
  defaultTempo: 76,
  clef: 'treble',
  events: [
    { id: 'emotional-am', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'emotional-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'emotional-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'emotional-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
  ],
}

const cMajorPopProgression: MusicalSequence = {
  id: 'c-major-pop-progression',
  title: 'I-V-vi-IV Progression in C',
  summary: 'C - G - Am - F',
  kind: 'chord',
  defaultTempo: 76,
  clef: 'treble',
  events: [
    { id: 'pop-i', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'pop-v', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'pop-vi', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'pop-iv', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
  ],
}

const slowBalladProgression: MusicalSequence = {
  id: 'slow-ballad-style-progression',
  title: 'Piano Ballad Style Progression',
  summary: 'Slow C major chord movement',
  kind: 'chord',
  defaultTempo: 64,
  clef: 'treble',
  events: [
    { id: 'ballad-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'ballad-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'ballad-am', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'ballad-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'ballad-c-return', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
  ],
}

const simpleMajorKeyPractice: MusicalSequence = {
  id: 'simple-major-key-practice',
  title: 'Simple Major Key Practice',
  summary: 'Scale fragment plus C, F, G, Am',
  kind: 'chord',
  defaultTempo: 84,
  clef: 'treble',
  events: [
    { id: 'simple-c4', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'simple-d4', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'simple-e4', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'simple-g4', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'simple-c-chord', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'simple-f-chord', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'simple-g-chord', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'simple-am-chord', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
  ],
}

const whiteKeyExploration: MusicalSequence = {
  id: 'white-key-exploration',
  title: 'White Key Exploration',
  summary: 'C major backing loop for exploration',
  kind: 'chord',
  defaultTempo: 76,
  clef: 'treble',
  events: [
    { id: 'white-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'white-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'white-am', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'white-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
  ],
}

const createYourOwnProgression: MusicalSequence = {
  id: 'create-your-own-progression',
  title: 'Create Your Own Progression',
  summary: 'Try C, G, F, and Am in a new order',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    { id: 'create-c', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'create-am', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'create-f', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'create-g', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
  ],
}

const majorMoodExploration: MusicalSequence = {
  id: 'major-mood-exploration',
  title: 'Major Mood Exploration',
  summary: 'Reorder C major notes and listen for mood',
  kind: 'scale',
  defaultTempo: 84,
  clef: 'treble',
  events: [
    { id: 'mood-c', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'mood-e', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mood-g', notes: ['G4'], durationBeats: 2, label: 'G4' },
    { id: 'mood-a', notes: ['A4'], durationBeats: 1, label: 'A4' },
    { id: 'mood-g-return', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'mood-e-return', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'mood-c-return', notes: ['C4'], durationBeats: 2, label: 'C4' },
  ],
}

const cMajorDiatonicChords: MusicalSequence = {
  id: 'c-major-diatonic-chords',
  title: 'C Major Diatonic Chords',
  summary: '8 measure-length chord changes',
  kind: 'chord',
  defaultTempo: 72,
  clef: 'treble',
  events: [
    { id: 'c-diatonic-i', notes: ['C4', 'E4', 'G4'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
    { id: 'c-diatonic-ii', notes: ['D4', 'F4', 'A4'], durationBeats: 4, label: 'D Minor - D F A', metadata: { chordName: 'D Minor' } },
    { id: 'c-diatonic-iii', notes: ['E4', 'G4', 'B4'], durationBeats: 4, label: 'E Minor - E G B', metadata: { chordName: 'E Minor' } },
    { id: 'c-diatonic-iv', notes: ['F4', 'A4', 'C5'], durationBeats: 4, label: 'F Major - F A C', metadata: { chordName: 'F Major' } },
    { id: 'c-diatonic-v', notes: ['G4', 'B4', 'D5'], durationBeats: 4, label: 'G Major - G B D', metadata: { chordName: 'G Major' } },
    { id: 'c-diatonic-vi', notes: ['A4', 'C5', 'E5'], durationBeats: 4, label: 'A Minor - A C E', metadata: { chordName: 'A Minor' } },
    { id: 'c-diatonic-vii', notes: ['B4', 'D5', 'F5'], durationBeats: 4, label: 'B Diminished - B D F', metadata: { chordName: 'B Diminished' } },
    { id: 'c-diatonic-i-high', notes: ['C5', 'E5', 'G5'], durationBeats: 4, label: 'C Major - C E G', metadata: { chordName: 'C Major' } },
  ],
}

const happyBirthday: MusicalSequence = {
  id: 'happy-birthday',
  title: 'Happy Birthday',
  summary: 'Familiar melody - simplified in C',
  kind: 'melody',
  defaultTempo: 88,
  clef: 'treble',
  events: [
    { id: 'happy-1', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'happy-2', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'happy-3', notes: ['A4'], durationBeats: 2, label: 'A4' },
    { id: 'happy-4', notes: ['G4'], durationBeats: 2, label: 'G4' },
    { id: 'happy-5', notes: ['C5'], durationBeats: 2, label: 'C5' },
    { id: 'happy-6', notes: ['B4'], durationBeats: 4, label: 'B4' },
    { id: 'happy-7', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'happy-8', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'happy-9', notes: ['A4'], durationBeats: 2, label: 'A4' },
    { id: 'happy-10', notes: ['G4'], durationBeats: 2, label: 'G4' },
    { id: 'happy-11', notes: ['D5'], durationBeats: 2, label: 'D5' },
    { id: 'happy-12', notes: ['C5'], durationBeats: 4, label: 'C5' },
  ],
}

const odeToJoy: MusicalSequence = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  summary: 'Familiar melody - simple stepwise movement',
  kind: 'melody',
  defaultTempo: 92,
  clef: 'treble',
  events: [
    { id: 'ode-1', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'ode-2', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'ode-3', notes: ['F4'], durationBeats: 1, label: 'F4' },
    { id: 'ode-4', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'ode-5', notes: ['G4'], durationBeats: 1, label: 'G4' },
    { id: 'ode-6', notes: ['F4'], durationBeats: 1, label: 'F4' },
    { id: 'ode-7', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'ode-8', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'ode-9', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'ode-10', notes: ['C4'], durationBeats: 1, label: 'C4' },
    { id: 'ode-11', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'ode-12', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'ode-13', notes: ['E4'], durationBeats: 1, label: 'E4' },
    { id: 'ode-14', notes: ['D4'], durationBeats: 1, label: 'D4' },
    { id: 'ode-15', notes: ['D4'], durationBeats: 2, label: 'D4' },
  ],
}

const maryHadALittleLamb: MusicalSequence = {
  id: 'mary-had-a-little-lamb',
  title: 'Mary Had a Little Lamb',
  summary: 'Beginner song - Stepwise melody',
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
    groups: [
      {
        id: 'beginner-major-scales',
        label: 'Beginner Major Scales',
        lessons: [cMajorScale, gMajorScale, fMajorScale],
      },
      {
        id: 'beginner-minor-scales',
        label: 'Beginner Minor Scales',
        lessons: [aNaturalMinorScale, eNaturalMinorScale, dNaturalMinorScale],
      },
      {
        id: 'pentatonic-scales',
        label: 'Pentatonic Scales',
        lessons: [
          cMajorPentatonicScale,
          aMinorPentatonicScale,
          gMajorPentatonicScale,
          eMinorPentatonicScale,
        ],
      },
      {
        id: 'blues-scales',
        label: 'Blues Scales',
        lessons: [aBluesScale, eBluesScale],
      },
      {
        id: 'chromatic-scales',
        label: 'Chromatic Scales',
        lessons: [cChromaticScale],
      },
    ],
  },
  {
    id: 'chords',
    label: 'Chords',
    groups: [
      {
        id: 'major-triads',
        label: 'Major Triads',
        lessons: [cMajorChord, fMajorChord, gMajorChord],
      },
      {
        id: 'minor-triads',
        label: 'Minor Triads',
        lessons: [aMinorChord],
      },
      {
        id: 'diatonic-chord-practice',
        label: 'Diatonic Chord Practice',
        description: 'Measure-length chord changes in one key.',
        lessons: [
          cMajorDiatonicChords,
          simpleChordMovement,
          cMajorCadenceProgression,
          cMajorPopProgression,
          emotionalMovementProgression,
          slowBalladProgression,
          simpleMajorKeyPractice,
          whiteKeyExploration,
          createYourOwnProgression,
          majorMoodExploration,
        ],
      },
    ],
  },
  {
    id: 'songs',
    label: 'Songs',
    groups: [
      {
        id: 'beginner-songs',
        label: 'Beginner Songs',
        lessons: [maryHadALittleLamb, happyBirthday, odeToJoy],
      },
    ],
  },
  {
    id: 'exercises',
    label: 'Exercises',
    groups: [],
  },
]

export const sequences = lessonCategories.flatMap((category) =>
  category.groups.flatMap((group) => group.lessons),
)
