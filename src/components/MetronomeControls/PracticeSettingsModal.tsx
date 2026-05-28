import type { AudioMode, TempoStepSize, TurnaroundMeasures } from '../../lib/musicTypes'

interface PracticeSettingsModalProps {
  audioMode: AudioMode
  isLoopEnabled: boolean
  isOpen: boolean
  onAudioModeChange: (audioMode: AudioMode) => void
  onClose: () => void
  onLoopEnabledChange: (isEnabled: boolean) => void
  onTempoChange: (tempo: number) => void
  onTempoStepSizeChange: (stepSize: TempoStepSize) => void
  onTurnaroundMeasuresChange: (measures: TurnaroundMeasures) => void
  tempo: number
  tempoStepSize: TempoStepSize
  turnaroundMeasures: TurnaroundMeasures
}

const audioModes: Array<{ label: string; value: AudioMode }> = [
  { label: 'Note + click', value: 'note-click' },
  { label: 'Note only', value: 'note-only' },
  { label: 'Click only', value: 'click-only' },
]

const tempoStepSizes: TempoStepSize[] = [1, 5, 10]
const turnaroundOptions: TurnaroundMeasures[] = [0, 1, 2]

export function PracticeSettingsModal({
  audioMode,
  isLoopEnabled,
  isOpen,
  onAudioModeChange,
  onClose,
  onLoopEnabledChange,
  onTempoChange,
  onTempoStepSizeChange,
  onTurnaroundMeasuresChange,
  tempo,
  tempoStepSize,
  turnaroundMeasures,
}: PracticeSettingsModalProps) {
  if (!isOpen) return null

  const adjustTempo = (direction: -1 | 1) => {
    onTempoChange(tempo + direction * tempoStepSize)
  }

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label="Practice settings"
        aria-modal="true"
        className="settings-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="settings-header">
          <div>
            <p className="eyebrow">Practice</p>
            <h2>Metronome Settings</h2>
          </div>
          <button aria-label="Close practice settings" onClick={onClose} type="button">Close</button>
        </div>

        <div className="settings-bpm">
          <span>{tempo}</span>
          <strong>BPM</strong>
        </div>

        <label className="settings-field">
          <span>Tempo</span>
          <input
            max="240"
            min="40"
            onChange={(event) => onTempoChange(Number(event.target.value))}
            step="1"
            type="range"
            value={tempo}
          />
        </label>

        <div className="settings-row">
          <button onClick={() => adjustTempo(-1)} type="button">-{tempoStepSize}</button>
          <button onClick={() => adjustTempo(1)} type="button">+{tempoStepSize}</button>
        </div>

        <label className="settings-field">
          <span>Tempo step size</span>
          <select
            onChange={(event) => onTempoStepSizeChange(Number(event.target.value) as TempoStepSize)}
            value={tempoStepSize}
          >
            {tempoStepSizes.map((stepSize) => (
              <option key={stepSize} value={stepSize}>
                {stepSize} BPM
              </option>
            ))}
          </select>
        </label>

        <label className="settings-field">
          <span>Metronome mode</span>
          <select
            onChange={(event) => onAudioModeChange(event.target.value as AudioMode)}
            value={audioMode}
          >
            {audioModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-check">
          <input
            checked={isLoopEnabled}
            onChange={(event) => onLoopEnabledChange(event.target.checked)}
            type="checkbox"
          />
          <span>Loop playback</span>
        </label>

        <label className="settings-field">
          <span>Turnaround measures</span>
          <select
            onChange={(event) => onTurnaroundMeasuresChange(Number(event.target.value) as TurnaroundMeasures)}
            value={turnaroundMeasures}
          >
            {turnaroundOptions.map((measureCount) => (
              <option key={measureCount} value={measureCount}>
                {measureCount}
              </option>
            ))}
          </select>
        </label>

        <p className="settings-note">
          After the phrase finishes its measure, add extra empty measures before looping.
        </p>
      </section>
    </div>
  )
}
