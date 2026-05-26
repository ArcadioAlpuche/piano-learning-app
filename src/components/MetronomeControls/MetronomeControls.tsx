import type { AudioMode } from '../../lib/musicTypes'

interface MetronomeControlsProps {
  audioMode: AudioMode
  onAudioModeChange: (audioMode: AudioMode) => void
}

const modes: Array<{ label: string; value: AudioMode }> = [
  { label: 'Note + click', value: 'note-click' },
  { label: 'Note only', value: 'note-only' },
  { label: 'Click only', value: 'click-only' },
]

export function MetronomeControls({ audioMode, onAudioModeChange }: MetronomeControlsProps) {
  return (
    <section className="metronome-controls" aria-label="Metronome audio mode">
      <label>
        <span>Audio</span>
        <select
          onChange={(event) => onAudioModeChange(event.target.value as AudioMode)}
          value={audioMode}
        >
          {modes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
