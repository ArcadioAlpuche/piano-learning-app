import type { MusicalEvent } from '../../lib/musicTypes'
import { formatEventNotes } from '../../lib/noteUtils'

interface CurrentEventDisplayProps {
  event: MusicalEvent
}

export function CurrentEventDisplay({ event }: CurrentEventDisplayProps) {
  return (
    <section className="current-event" aria-live="polite">
      <span>Current</span>
      <strong>{event.label}</strong>
      <small>{formatEventNotes(event)}</small>
    </section>
  )
}
