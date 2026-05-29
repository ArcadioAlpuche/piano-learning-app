import { useMemo, useState } from 'react'
import { CurrentEventDisplay } from './components/CurrentEventDisplay/CurrentEventDisplay'
import { LearningModePanel } from './components/LearningMode/LearningModePanel'
import { LessonSelectionModal } from './components/LessonSelectionModal/LessonSelectionModal'
import { PracticeSettingsModal } from './components/MetronomeControls/PracticeSettingsModal'
import { PianoKeyboard } from './components/PianoKeyboard/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls/PlaybackControls'
import { ProgressSlider } from './components/ProgressSlider/ProgressSlider'
import { StaffNotation } from './components/StaffNotation/StaffNotation'
import { lessonCategories, sequences } from './data/sequences'
import { learningPhases } from './data/learningPhases'
import { usePlaybackEngine } from './hooks/usePlaybackEngine'
import type { KeyboardRangeOption, MusicalSequence } from './lib/musicTypes'
import './App.css'

type AppMode = 'learn' | 'practice'

function App() {
  const [selectedSequenceId, setSelectedSequenceId] = useState(sequences[0].id)
  const [keyboardRange, setKeyboardRange] = useState<KeyboardRangeOption>('two-octave')
  const [appMode, setAppMode] = useState<AppMode>('practice')

  const selectedSequence = useMemo(
    () => sequences.find((sequence) => sequence.id === selectedSequenceId) ?? sequences[0],
    [selectedSequenceId],
  )

  return (
    <main className="app-shell">
      <LearningSession
        key={selectedSequence.id}
        appMode={appMode}
        keyboardRange={keyboardRange}
        onKeyboardRangeChange={setKeyboardRange}
        onModeChange={setAppMode}
        onSequenceChange={(sequence) => setSelectedSequenceId(sequence.id)}
        selectedSequenceId={selectedSequenceId}
        sequence={selectedSequence}
      />
    </main>
  )
}

interface LearningSessionProps {
  appMode: AppMode
  keyboardRange: KeyboardRangeOption
  onKeyboardRangeChange: (range: KeyboardRangeOption) => void
  onModeChange: (mode: AppMode) => void
  onSequenceChange: (sequence: MusicalSequence) => void
  selectedSequenceId: string
  sequence: MusicalSequence
}

function LearningSession({
  appMode,
  keyboardRange,
  onKeyboardRangeChange,
  onModeChange,
  selectedSequenceId,
  sequence,
  onSequenceChange,
}: LearningSessionProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false)
  const playback = usePlaybackEngine({ sequence })
  const activeNotes = playback.activeNotes
  const sequenceNotes = useMemo(
    () => Array.from(new Set(sequence.events.flatMap((event) => event.notes))),
    [sequence],
  )
  const sequencesById = useMemo(
    () => new Map(sequences.map((sequenceOption) => [sequenceOption.id, sequenceOption])),
    [],
  )
  const selectLesson = (lesson: MusicalSequence) => {
    playback.stop()
    onSequenceChange(lesson)
  }
  const handleModeChange = (nextMode: AppMode) => {
    playback.stop()
    onModeChange(nextMode)
    setIsLessonModalOpen(false)
    setIsLearnModalOpen(false)
  }

  return (
    <>
      <header className="top-control-bar">
        <div className="brand-block">
          <p className="eyebrow">Phase 1</p>
          <h1>Piano Learning Playback</h1>
        </div>

        <label className="mode-select">
          <span>Mode</span>
          <select
            onChange={(event) => handleModeChange(event.target.value as AppMode)}
            value={appMode}
          >
            <option value="learn">Learn</option>
            <option value="practice">Practice Library</option>
          </select>
        </label>

        <div className="lesson-picker">
          <span>{appMode === 'learn' ? 'Learn Path' : 'Lesson'}</span>
          <button
            aria-label="Open lesson selection"
            onClick={() => {
              if (appMode === 'learn') {
                setIsLearnModalOpen(true)
              } else {
                setIsLessonModalOpen(true)
              }
            }}
            type="button"
          >
            {appMode === 'learn' ? `Phase 1 - ${sequence.title}` : sequence.title}
          </button>
        </div>

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

        <button
          aria-label="Open practice settings"
          className="practice-status"
          onClick={() => setIsSettingsOpen(true)}
          title="Open practice settings"
          type="button"
        >
          <span>Practice</span>
          <strong>
            {playback.audioMode === 'note-click' ? 'Note + click' : playback.audioMode === 'note-only' ? 'Note only' : 'Click only'} -{' '}
            {playback.isLoopEnabled ? `Loop ${playback.turnaroundMeasures}m` : 'Loop off'}
          </strong>
        </button>

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

      <PracticeSettingsModal
        audioMode={playback.audioMode}
        isLoopEnabled={playback.isLoopEnabled}
        isOpen={isSettingsOpen}
        onAudioModeChange={playback.setAudioMode}
        onClose={() => setIsSettingsOpen(false)}
        onLoopEnabledChange={playback.setIsLoopEnabled}
        onTempoChange={playback.setTempo}
        onTempoStepSizeChange={playback.setTempoStepSize}
        onTurnaroundMeasuresChange={playback.setTurnaroundMeasures}
        tempo={playback.tempo}
        tempoStepSize={playback.tempoStepSize}
        turnaroundMeasures={playback.turnaroundMeasures}
      />

      <LessonSelectionModal
        categories={lessonCategories}
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSelectLesson={(lesson) => {
          selectLesson(lesson)
          setIsLessonModalOpen(false)
        }}
        selectedLessonId={selectedSequenceId}
      />

      <LearningModePanel
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        onSelectLesson={(lesson) => {
          selectLesson(lesson)
          setIsLearnModalOpen(false)
        }}
        phases={learningPhases}
        selectedLessonId={selectedSequenceId}
        sequencesById={sequencesById}
      />
    </>
  )
}

export default App
