import { useMemo, useState } from 'react'
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
  const defaultSectionId = useMemo(() => phases[0]?.sections[0]?.id ?? null, [phases])
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(defaultSectionId)

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
            <h2>Phase Library</h2>
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

              <div className="learn-section-list">
                {phase.sections.map((section, sectionIndex) => {
                  const isExpanded =
                    expandedSectionId === section.id || (!expandedSectionId && sectionIndex === 0)

                  return (
                    <section className="learn-section" key={section.id}>
                      <button
                        aria-expanded={isExpanded}
                        className="learn-section-toggle"
                        onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                        type="button"
                      >
                        <span>{isExpanded ? '-' : '+'}</span>
                        <div>
                          <h3>{section.title}</h3>
                          <p>{section.description}</p>
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="learn-lesson-grid">
                          {section.lessons.map((lessonRef) => {
                            const lesson = lessonRef.lessonId ? sequencesById.get(lessonRef.lessonId) : undefined
                            const isPlayable = lessonRef.playable !== false && Boolean(lesson)
                            const isSelected = selectedLessonId === lessonRef.lessonId

                            return (
                              <button
                                className={isSelected ? 'selected' : ''}
                                disabled={!isPlayable}
                                key={lessonRef.id}
                                onClick={() => {
                                  if (lesson) {
                                    onSelectLesson(lesson)
                                  }
                                }}
                                type="button"
                              >
                                <span>{lessonRef.type}</span>
                                <strong>{lessonRef.title}</strong>
                                <p>{lessonRef.purpose}</p>
                                {lessonRef.unlocks?.length ? (
                                  <small>Helps with: {lessonRef.unlocks.join(', ')}</small>
                                ) : (
                                  <small>{isPlayable ? 'Playable' : 'Coming later'}</small>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </section>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
