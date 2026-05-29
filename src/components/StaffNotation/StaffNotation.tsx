import { useEffect, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import type { MusicalSequence } from '../../lib/musicTypes'
import {
  beatsToVexDuration,
  formatBeatCount,
  formatSequenceDurationSummary,
  noteToVexKey,
  parseNote,
} from '../../lib/noteUtils'
import './StaffNotation.css'

interface StaffNotationProps {
  sequence: MusicalSequence
  currentStepIndex: number
}

const BEATS_PER_MEASURE = 4

function getSequenceKindLabel(sequence: MusicalSequence) {
  if (sequence.kind === 'scale') return 'Scale'
  if (sequence.kind === 'chord') return 'Chord'
  return 'Melody'
}

export function StaffNotation({ sequence, currentStepIndex }: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const totalBeats = sequence.events.reduce((total, event) => total + event.durationBeats, 0)
  const totalMeasureBeats = Math.max(BEATS_PER_MEASURE, Math.ceil(totalBeats / BEATS_PER_MEASURE) * BEATS_PER_MEASURE)
  const measureCount = totalMeasureBeats / BEATS_PER_MEASURE
  const completionBeats = totalMeasureBeats - totalBeats
  const measureSeparators = Array.from({ length: measureCount + 1 }, (_, index) => index)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    const width = Math.max(container.clientWidth, 640)
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(width, 156)

    const context = renderer.getContext()
    const stave = new Stave(16, 24, width - 32)
    stave.addClef(sequence.clef).addTimeSignature('4/4')
    stave.setContext(context).draw()

    const notes = sequence.events.map((event, index) => {
      const staveNote = new StaveNote({
        clef: sequence.clef,
        keys: event.notes.map(noteToVexKey),
        duration: beatsToVexDuration(event.durationBeats),
      })

      event.notes.forEach((note, noteIndex) => {
        const { pitchClass } = parseNote(note)

        if (pitchClass.includes('#')) {
          staveNote.addModifier(new Accidental('#'), noteIndex)
        } else if (pitchClass.includes('b')) {
          staveNote.addModifier(new Accidental('b'), noteIndex)
        }
      })

      if (index === currentStepIndex) {
        staveNote.setStyle({ fillStyle: '#d68200', strokeStyle: '#d68200' })
      }

      return staveNote
    })

    const voice = new Voice({
      numBeats: sequence.events.reduce((total, event) => total + event.durationBeats, 0),
      beatValue: 4,
    }).setStrict(false)

    voice.addTickables(notes)
    new Formatter().joinVoices([voice]).format([voice], width - 108)
    voice.draw(context, stave)
  }, [currentStepIndex, sequence])

  return (
    <section className="staff-panel" aria-label="Staff notation">
      <div className="panel-heading">
        <div>
          <h2>{sequence.title}</h2>
          <p>{formatSequenceDurationSummary(sequence)}</p>
        </div>
        <span>{getSequenceKindLabel(sequence)}</span>
      </div>
      <div className="staff-scroll">
        <div className="staff-canvas" ref={containerRef} />
        <div className="measure-guide" aria-label="4/4 duration guide">
          <div className="measure-strip">
            {measureSeparators.map((separator) => (
              <span
                aria-hidden="true"
                className="measure-separator"
                key={separator}
                style={{ left: `${(separator * BEATS_PER_MEASURE * 100) / totalMeasureBeats}%` }}
              />
            ))}
            {sequence.events.map((event, index) => (
              <span
                className={`measure-segment${index === currentStepIndex ? ' is-active' : ''}`}
                key={event.id}
                style={{ flexBasis: `${(event.durationBeats * 100) / totalMeasureBeats}%` }}
                title={`${event.label} - ${formatBeatCount(event.durationBeats)}`}
              >
                <strong>{event.metadata?.chordName ?? event.label}</strong>
                <small>{formatBeatCount(event.durationBeats)}</small>
              </span>
            ))}
            {completionBeats > 0 ? (
              <span
                className="measure-segment measure-rest"
                style={{ flexBasis: `${(completionBeats * 100) / totalMeasureBeats}%` }}
                title={`Complete measure - ${formatBeatCount(completionBeats)}`}
              >
                <strong>Complete measure</strong>
                <small>{formatBeatCount(completionBeats)}</small>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
