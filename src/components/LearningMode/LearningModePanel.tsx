import type { LearningPhase, MusicalSequence } from '../../lib/musicTypes'
import './LearningModePanel.css'

interface LearningModePanelProps {
  isOpen: boolean
  onClose: () => void
  phases: LearningPhase[]
  selectedLessonId: string
  sequencesById: Map<string, MusicalSequence>
  onSelectLesson: (lesson: MusicalSequence) => void
}

export function LearningModePanel({
  isOpen,
  onClose,
  phases,
  selectedLessonId,
  sequencesById,
  onSelectLesson,
}: LearningModePanelProps) {
  if (!isOpen) return null

  return (
    <div className="learn-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label="Learn selection"
        aria-modal="true"
        className="learn-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="learn-modal-header">
          <div>
            <p className="eyebrow">Learn</p>
            <h2>Learning Paths</h2>
          </div>
          <button onClick={onClose} type="button">Close</button>
        </div>

        <div className="learn-modal-content">
          {phases.map((phase) => (
            <article className="learn-phase" key={phase.id}>
              <div className="learn-phase-heading">
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
              </div>

              <div className="learn-path-list">
                {phase.paths.map((path) => (
                  <section className="learn-path" key={path.id}>
                    <div className="learn-path-heading">
                      <h3>{path.title}</h3>
                      <p>{path.description}</p>
                      <strong>{path.goal}</strong>
                    </div>

                    <div className="learn-lesson-grid">
                      {path.lessonRefs.map((lessonRef) => {
                        const lesson = sequencesById.get(lessonRef.lessonId)
                        const isSelected = selectedLessonId === lessonRef.lessonId

                        return (
                          <button
                            className={isSelected ? 'selected' : ''}
                            disabled={!lesson}
                            key={lessonRef.id}
                            onClick={() => {
                              if (lesson) {
                                onSelectLesson(lesson)
                              }
                            }}
                            type="button"
                          >
                            <span>{lessonRef.lessonType}</span>
                            <strong>{lessonRef.title}</strong>
                            <p>{lessonRef.purpose}</p>
                            <small>{lesson ? 'Playable' : 'Coming later'}</small>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
