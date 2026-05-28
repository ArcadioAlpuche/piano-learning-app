import { useMemo, useState } from 'react'
import { CurrentEventDisplay } from './components/CurrentEventDisplay/CurrentEventDisplay'
import { LessonSelectionModal } from './components/LessonSelectionModal/LessonSelectionModal'
import { PracticeSettingsModal } from './components/MetronomeControls/PracticeSettingsModal'
import { PianoKeyboard } from './components/PianoKeyboard/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls/PlaybackControls'
import { ProgressSlider } from './components/ProgressSlider/ProgressSlider'
import { StaffNotation } from './components/StaffNotation/StaffNotation'
import { lessonCategories, sequences } from './data/sequences'
import { usePlaybackEngine } from './hooks/usePlaybackEngine'
import type { KeyboardRangeOption, MusicalSequence } from './lib/musicTypes'
import './App.css'

function App() {
  const [selectedSequenceId, setSelectedSequenceId] = useState(sequences[0].id)
  const [keyboardRange, setKeyboardRange] = useState<KeyboardRangeOption>('two-octave')

  const selectedSequence = useMemo(
    () => sequences.find((sequence) => sequence.id === selectedSequenceId) ?? sequences[0],
    [selectedSequenceId],
  )

  return (
    <main className="app-shell">
      <LearningSession
        key={selectedSequence.id}
        keyboardRange={keyboardRange}
        onKeyboardRangeChange={setKeyboardRange}
        onSequenceChange={(sequence) => setSelectedSequenceId(sequence.id)}
        selectedSequenceId={selectedSequenceId}
        sequence={selectedSequence}
      />
    </main>
  )
}

interface LearningSessionProps {
  keyboardRange: KeyboardRangeOption
  onKeyboardRangeChange: (range: KeyboardRangeOption) => void
  onSequenceChange: (sequence: MusicalSequence) => void
  selectedSequenceId: string
  sequence: MusicalSequence
}

function LearningSession({
  keyboardRange,
  onKeyboardRangeChange,
  selectedSequenceId,
  sequence,
  onSequenceChange,
}: LearningSessionProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const playback = usePlaybackEngine({ sequence })
  const activeNotes = playback.activeNotes
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

        <div className="lesson-picker">
          <span>Lesson</span>
          <button
            aria-label="Open lesson selection"
            onClick={() => setIsLessonModalOpen(true)}
            type="button"
          >
            {sequence.title}
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
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStop={playback.stop}
          onStepBackward={playback.stepBackward}
          onStepForward={playback.stepForward}
          onTempoChange={playback.setTempo}
          onTogglePlayback={playback.isPlaying ? playback.pause : playback.play}
          tempo={playback.tempo}
        />

        <div className="practice-status" aria-label="Practice loop status">
          <span>{playback.audioMode === 'note-click' ? 'Note + click' : playback.audioMode === 'note-only' ? 'Note only' : 'Click only'}</span>
          <strong>{playback.isLoopEnabled ? `Loop ${playback.turnaroundMeasures}m` : 'Loop off'}</strong>
        </div>

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
          playback.stop()
          onSequenceChange(lesson)
          setIsLessonModalOpen(false)
        }}
        selectedLessonId={selectedSequenceId}
      />
    </>
  )
}

export default App
