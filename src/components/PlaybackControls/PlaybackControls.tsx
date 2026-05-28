interface PlaybackControlsProps {
  isPlaying: boolean
  tempo: number
  onOpenSettings: () => void
  onTogglePlayback: () => void
  onStop: () => void
  onStepBackward: () => void
  onStepForward: () => void
  onTempoChange: (tempo: number) => void
}

export function PlaybackControls({
  isPlaying,
  tempo,
  onOpenSettings,
  onTogglePlayback,
  onStop,
  onStepBackward,
  onStepForward,
  onTempoChange,
}: PlaybackControlsProps) {
  return (
    <section className="playback-controls" aria-label="Playback controls">
      <button className="primary" onClick={onTogglePlayback} type="button">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onStop} type="button">Stop</button>
      <button onClick={onStepBackward} type="button">Step Back</button>
      <button onClick={onStepForward} type="button">Step Forward</button>

      <label className="tempo-control">
        <span>Tempo: {tempo} BPM</span>
        <input
          max="240"
          min="40"
          onChange={(event) => onTempoChange(Number(event.target.value))}
          step="1"
          type="range"
          value={tempo}
        />
      </label>
      <button onClick={onOpenSettings} type="button">Settings</button>
    </section>
  )
}
