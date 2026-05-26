import { useMemo, useState } from 'react'
import { CurrentEventDisplay } from './components/CurrentEventDisplay/CurrentEventDisplay'
import { MetronomeControls } from './components/MetronomeControls/MetronomeControls'
import { PianoKeyboard } from './components/PianoKeyboard/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls/PlaybackControls'
import { ProgressSlider } from './components/ProgressSlider/ProgressSlider'
import { StaffNotation } from './components/StaffNotation/StaffNotation'
import { lessonCategories } from './data/sequences'
import { usePlaybackEngine } from './hooks/usePlaybackEngine'
import type { KeyboardRangeOption, LessonCategoryId } from './lib/musicTypes'
import './App.css'

function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<LessonCategoryId>(lessonCategories[0].id)
  const [selectedSequenceId, setSelectedSequenceId] = useState(lessonCategories[0].items[0].id)
  const [keyboardRange, setKeyboardRange] = useState<KeyboardRangeOption>('two-octave')

  const selectedCategory = useMemo(
    () => lessonCategories.find((category) => category.id === selectedCategoryId) ?? lessonCategories[0],
    [selectedCategoryId],
  )

  const selectedSequence = useMemo(
    () => selectedCategory.items.find((sequence) => sequence.id === selectedSequenceId) ?? selectedCategory.items[0],
    [selectedCategory, selectedSequenceId],
  )

  const handleCategoryChange = (categoryId: LessonCategoryId) => {
    const nextCategory = lessonCategories.find((category) => category.id === categoryId) ?? lessonCategories[0]
    setSelectedCategoryId(nextCategory.id)
    setSelectedSequenceId(nextCategory.items[0].id)
  }

  return (
    <main className="app-shell">
      <LearningSession
        key={selectedSequence.id}
        keyboardRange={keyboardRange}
        onCategoryChange={handleCategoryChange}
        onKeyboardRangeChange={setKeyboardRange}
        onSequenceChange={setSelectedSequenceId}
        selectedCategoryId={selectedCategoryId}
        selectedSequenceId={selectedSequenceId}
        sequenceOptions={selectedCategory.items}
        sequence={selectedSequence}
      />
    </main>
  )
}

interface LearningSessionProps {
  keyboardRange: KeyboardRangeOption
  onCategoryChange: (categoryId: LessonCategoryId) => void
  onKeyboardRangeChange: (range: KeyboardRangeOption) => void
  onSequenceChange: (sequenceId: string) => void
  selectedCategoryId: LessonCategoryId
  selectedSequenceId: string
  sequence: typeof lessonCategories[number]['items'][number]
  sequenceOptions: typeof lessonCategories[number]['items']
}

function LearningSession({
  keyboardRange,
  onCategoryChange,
  onKeyboardRangeChange,
  onSequenceChange,
  selectedCategoryId,
  selectedSequenceId,
  sequence,
  sequenceOptions,
}: LearningSessionProps) {
  const playback = usePlaybackEngine({ sequence })
  const activeNotes = playback.currentEvent.notes
  const sequenceNotes = useMemo(
    () => Array.from(new Set(sequence.events.flatMap((event) => event.notes))),
    [sequence],
  )

  return (
    <>
      <header className="top-control-bar">
        <div className="brand-block">
          <p className="eyebrow">Phase 1</p>
          <h1>Piano Learning Playback</h1>
        </div>

        <label className="nav-select">
          <span>Category</span>
          <select
            onChange={(event) => onCategoryChange(event.target.value as LessonCategoryId)}
            value={selectedCategoryId}
          >
            {lessonCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="nav-select">
          <span>Lesson</span>
          <select
            onChange={(event) => onSequenceChange(event.target.value)}
            value={selectedSequenceId}
          >
            {sequenceOptions.map((sequenceOption) => (
              <option key={sequenceOption.id} value={sequenceOption.id}>
                {sequenceOption.title}
              </option>
            ))}
          </select>
        </label>

        <label className="nav-select">
          <span>Keyboard</span>
          <select
            onChange={(event) => onKeyboardRangeChange(event.target.value as KeyboardRangeOption)}
            value={keyboardRange}
          >
            <option value="one-octave">1 octave</option>
            <option value="two-octave">2 octaves</option>
          </select>
        </label>

        <PlaybackControls
          isPlaying={playback.isPlaying}
          onStop={playback.stop}
          onStepBackward={playback.stepBackward}
          onStepForward={playback.stepForward}
          onTempoChange={playback.setTempo}
          onTogglePlayback={playback.isPlaying ? playback.pause : playback.play}
          tempo={playback.tempo}
        />

        <MetronomeControls
          audioMode={playback.audioMode}
          onAudioModeChange={playback.setAudioMode}
        />

        <div className="compact-current">
          <CurrentEventDisplay event={playback.currentEvent} />
        </div>
      </header>

      <section className="learning-stage">
        <div className="notation-track">
          <ProgressSlider
            currentStepIndex={playback.currentStepIndex}
            lastStepIndex={playback.lastStepIndex}
            onSeek={playback.seek}
          />
          <StaffNotation currentStepIndex={playback.currentStepIndex} sequence={sequence} />
        </div>
      </section>

      <PianoKeyboard
        activeNotes={activeNotes}
        onPreviewNotes={playback.previewNotes}
        range={keyboardRange}
        sequenceNotes={sequenceNotes}
      />
    </>
  )
}

export default App
