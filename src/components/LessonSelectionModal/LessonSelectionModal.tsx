import { useMemo, useState } from 'react'
import type { LessonCategory, LessonCategoryId, MusicalSequence } from '../../lib/musicTypes'
import './LessonSelectionModal.css'

interface LessonSelectionModalProps {
  categories: LessonCategory[]
  isOpen: boolean
  onClose: () => void
  onSelectLesson: (lesson: MusicalSequence) => void
  selectedLessonId: string
}

export function LessonSelectionModal({
  categories,
  isOpen,
  onClose,
  onSelectLesson,
  selectedLessonId,
}: LessonSelectionModalProps) {
  const firstScaleGroupId =
    categories
      .find((category) => category.id === 'scales')
      ?.groups.find((group) => group.lessons.length > 0)?.id ?? ''
  const [activeCategoryId, setActiveCategoryId] = useState<LessonCategoryId>(categories[0]?.id ?? 'scales')
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(firstScaleGroupId ? [firstScaleGroupId] : [])
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  )
  const visibleGroups = activeCategory?.groups.filter((group) => group.lessons.length > 0) ?? []
  const usesAccordion = activeCategoryId === 'scales'

  const handleCategoryClick = (categoryId: LessonCategoryId) => {
    const nextCategory = categories.find((category) => category.id === categoryId)
    const firstGroupId = nextCategory?.groups.find((group) => group.lessons.length > 0)?.id

    setActiveCategoryId(categoryId)
    setExpandedGroupIds(categoryId === 'scales' && firstGroupId ? [firstGroupId] : [])
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((currentGroupIds) =>
      currentGroupIds.includes(groupId)
        ? currentGroupIds.filter((currentGroupId) => currentGroupId !== groupId)
        : [...currentGroupIds, groupId],
    )
  }

  if (!isOpen) return null

  return (
    <div className="lesson-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label="Select lesson"
        aria-modal="true"
        className="lesson-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="lesson-modal-header">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Select Lesson</h2>
          </div>
          <button onClick={onClose} type="button">Close</button>
        </div>

        <div className="lesson-modal-body">
          <nav className="lesson-category-tabs" aria-label="Lesson categories">
            {categories.map((category) => {
              const hasLessons = category.groups.some((group) => group.lessons.length > 0)

              return (
                <button
                  aria-pressed={activeCategoryId === category.id}
                  className={activeCategoryId === category.id ? 'active' : ''}
                  disabled={!hasLessons}
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  type="button"
                >
                  {category.label}
                  {!hasLessons ? <span>Coming later</span> : null}
                </button>
              )
            })}
          </nav>

          <div className="lesson-group-list">
            {visibleGroups.length === 0 ? (
              <div className="lesson-empty">
                <strong>{activeCategory?.label ?? 'Lessons'}</strong>
                <p>Coming later.</p>
              </div>
            ) : (
              visibleGroups.map((group) => {
                const isExpanded = !usesAccordion || expandedGroupIds.includes(group.id)
                const groupLessonsId = `lesson-group-${group.id}`

                return (
                  <section className={`lesson-group ${usesAccordion ? 'accordion' : ''}`} key={group.id}>
                    {usesAccordion ? (
                      <button
                        aria-controls={groupLessonsId}
                        aria-expanded={isExpanded}
                        className="lesson-group-toggle"
                        onClick={() => toggleGroup(group.id)}
                        type="button"
                      >
                        <span>{isExpanded ? 'v' : '>'}</span>
                        <strong>{group.label}</strong>
                      </button>
                    ) : (
                      <div className="lesson-group-heading">
                        <h3>{group.label}</h3>
                        {group.description ? <p>{group.description}</p> : null}
                      </div>
                    )}

                    {isExpanded ? (
                      <div className="lesson-card-list" id={groupLessonsId}>
                        {group.lessons.map((lesson) => (
                          <button
                            className={lesson.id === selectedLessonId ? 'selected' : ''}
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson)}
                            type="button"
                          >
                            <strong>{lesson.title}</strong>
                            <span>
                              {lesson.summary ??
                                `${lesson.events.length} ${lesson.events.length === 1 ? 'event' : 'events'}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </section>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
