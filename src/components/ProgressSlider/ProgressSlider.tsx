import './ProgressSlider.css'

interface ProgressSliderProps {
  currentStepIndex: number
  lastStepIndex: number
  onSeek: (stepIndex: number) => void
}

export function ProgressSlider({ currentStepIndex, lastStepIndex, onSeek }: ProgressSliderProps) {
  const steps = Array.from({ length: lastStepIndex + 1 }, (_, index) => index)

  return (
    <section className="timeline-panel" aria-label="Sequence timeline">
      <div className="timeline-heading">
        <span>Progression</span>
        <strong>
          Step {currentStepIndex + 1} of {lastStepIndex + 1}
        </strong>
      </div>

      <div className="timeline-control">
        <input
          aria-label="Seek sequence step"
          max={lastStepIndex}
          min="0"
          onChange={(event) => onSeek(Number(event.target.value))}
          step="1"
          type="range"
          value={currentStepIndex}
        />
        <div className="timeline-notches" aria-hidden="true">
          {steps.map((stepIndex) => {
            const left = lastStepIndex === 0 ? 50 : (stepIndex / lastStepIndex) * 100

            return (
              <button
                className={stepIndex === currentStepIndex ? 'active' : ''}
                key={stepIndex}
                onClick={() => onSeek(stepIndex)}
                style={{ left: `${left}%` }}
                tabIndex={-1}
                type="button"
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
