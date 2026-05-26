export type NoteName = string

export type AudioMode = 'note-click' | 'note-only' | 'click-only'

export type LessonCategoryId = 'scales' | 'chords' | 'songs'

export type SequenceKind = 'scale' | 'chord' | 'melody'

export type KeyboardRangeOption = 'one-octave' | 'two-octave'

export interface MusicalEvent {
  id: string
  notes: NoteName[]
  durationBeats: number
  label: string
  fingering?: string[]
  metadata?: {
    scaleDegree?: number
    chordName?: string
    section?: string
  }
}

export interface MusicalSequence {
  id: string
  title: string
  kind: SequenceKind
  defaultTempo: number
  clef: 'treble'
  events: MusicalEvent[]
}

export interface LessonCategory {
  id: LessonCategoryId
  label: string
  items: MusicalSequence[]
}
