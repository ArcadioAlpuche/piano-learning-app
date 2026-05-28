import { useEffect, useRef } from 'react'
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import type { MusicalSequence } from '../../lib/musicTypes'
import { beatsToVexDuration, noteToVexKey, parseNote } from '../../lib/noteUtils'
import './StaffNotation.css'

interface StaffNotationProps {
  sequence: MusicalSequence
  currentStepIndex: number
}

export function StaffNotation({ sequence, currentStepIndex }: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

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
        <h2>{sequence.title}</h2>
        <span>{sequence.kind === 'scale' ? 'Scale' : 'Melody'}</span>
      </div>
      <div className="staff-scroll">
        <div className="staff-canvas" ref={containerRef} />
      </div>
    </section>
  )
}
