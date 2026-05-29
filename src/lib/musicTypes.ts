export type NoteName = string

export type AudioMode = 'note-click' | 'note-only' | 'click-only'

export type LessonCategoryId = 'scales' | 'chords' | 'songs' | 'exercises'

export type PlaybackPhase = 'sequence' | 'measure-completion' | 'turnaround' | 'stopped'

export type SequenceKind = 'scale' | 'chord' | 'melody'

export type KeyboardRangeOption = 'one-octave' | 'two-octave'

export type TempoStepSize = 1 | 5 | 10

export type TurnaroundMeasures = 0 | 1 | 2

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
  summary?: string
  kind: SequenceKind
  defaultTempo: number
  clef: 'treble'
  events: MusicalEvent[]
}

export interface LessonCategory {
  id: LessonCategoryId
  label: string
  groups: LessonGroup[]
}

export interface LessonGroup {
  id: string
  label: string
  description?: string
  lessons: MusicalSequence[]
}

export type LearningLessonType = 'scale' | 'chord' | 'progression' | 'song' | 'rhythm' | 'concept'

export interface LearningLessonRef {
  id: string
  lessonId: string
  lessonType: LearningLessonType
  title: string
  purpose: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  goal: string
  lessonRefs: LearningLessonRef[]
}

export interface LearningPhase {
  id: string
  title: string
  description: string
  paths: LearningPath[]
}
