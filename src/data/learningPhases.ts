import type { LearningPhase } from '../lib/musicTypes'

export const learningPhases: LearningPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1 - Play Your First Songs',
    description:
      'Build confidence with beginner-friendly scales, chords, rhythm, and simple progressions that lead toward recognizable music.',
    paths: [
      {
        id: 'major-key-foundations',
        title: 'Major Key Foundations',
        description: 'A practical path through the C major sound: notes, home chords, movement, and song-like patterns.',
        goal: 'Understand how a major key connects scales, chords, and simple song-like progressions.',
        lessonRefs: [
          {
            id: 'learn-c-major-scale',
            lessonId: 'c-major-scale',
            lessonType: 'scale',
            title: 'C Major Scale',
            purpose: 'Learn the notes that form the foundation for many beginner songs.',
          },
          {
            id: 'learn-c-major-chord',
            lessonId: 'c-major-chord',
            lessonType: 'chord',
            title: 'C Major Chord',
            purpose: 'Learn your first stable home chord.',
          },
          {
            id: 'learn-f-major-chord',
            lessonId: 'f-major-chord',
            lessonType: 'chord',
            title: 'F Major Chord',
            purpose: 'Learn a common chord that pairs with C major.',
          },
          {
            id: 'learn-g-major-chord',
            lessonId: 'g-major-chord',
            lessonType: 'chord',
            title: 'G Major Chord',
            purpose: 'Learn the chord that creates movement back to C.',
          },
          {
            id: 'learn-a-minor-chord',
            lessonId: 'a-minor-chord',
            lessonType: 'chord',
            title: 'A Minor Chord',
            purpose: 'Add a common minor sound used in many songs.',
          },
          {
            id: 'learn-pop-progression',
            lessonId: 'c-major-pop-progression',
            lessonType: 'progression',
            title: 'I-V-vi-IV Progression in C',
            purpose: 'Practice a song-like chord progression used in many pop songs.',
          },
          {
            id: 'learn-simple-major-practice',
            lessonId: 'simple-major-key-practice',
            lessonType: 'progression',
            title: 'Simple Major Key Practice',
            purpose: 'Put the scale and chords together in a short musical practice pattern.',
          },
        ],
      },
    ],
  },
]
