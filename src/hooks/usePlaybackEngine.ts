import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Tone from 'tone'
import type { AudioMode, MusicalEvent, MusicalSequence } from '../lib/musicTypes'

interface PlaybackEngineOptions {
  sequence: MusicalSequence
}

const MIN_BEAT_DURATION = 0.001

function clampTempo(tempo: number) {
  return Math.min(Math.max(tempo, 30), 240)
}

function clampStepIndex(stepIndex: number, lastStepIndex: number) {
  if (lastStepIndex < 0) return 0
  return Math.min(Math.max(stepIndex, 0), lastStepIndex)
}

function getEventDuration(event: MusicalEvent) {
  return Math.max(event.durationBeats, MIN_BEAT_DURATION)
}

function getTotalBeats(sequence: MusicalSequence) {
  return sequence.events.reduce((total, event) => total + getEventDuration(event), 0)
}

function getEventStartBeat(sequence: MusicalSequence, stepIndex: number) {
  return sequence.events
    .slice(0, clampStepIndex(stepIndex, sequence.events.length - 1))
    .reduce((total, event) => total + getEventDuration(event), 0)
}

function getEventIndexAtBeat(sequence: MusicalSequence, beat: number) {
  let beatCursor = 0

  for (let index = 0; index < sequence.events.length; index += 1) {
    beatCursor += getEventDuration(sequence.events[index])

    if (beat < beatCursor) {
      return index
    }
  }

  return -1
}

export function usePlaybackEngine({ sequence }: PlaybackEngineOptions) {
  const [currentStepIndex, setCurrentStepIndexState] = useState(0)
  const [isPlaying, setIsPlayingState] = useState(false)
  const [tempo, setTempoState] = useState(sequence.defaultTempo)
  const [audioMode, setAudioModeState] = useState<AudioMode>('note-click')

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const clickRef = useRef<Tone.MembraneSynth | null>(null)
  const playbackStartTimeRef = useRef(0)
  const playbackStartBeatRef = useRef(0)
  const currentStepIndexRef = useRef(0)
  const currentBeatRef = useRef(0)
  const lastMetronomeBeatRef = useRef(-1)
  const animationFrameIdRef = useRef<number | null>(null)
  const schedulerFrameRef = useRef<(runId: number, now: number) => void>(() => {})
  const schedulerRunIdRef = useRef(0)
  const commandIdRef = useRef(0)
  const isPlayingRef = useRef(false)
  const tempoRef = useRef(tempo)
  const audioModeRef = useRef(audioMode)
  const selectedSequenceRef = useRef(sequence)
  const lastTriggeredStepIndexRef = useRef<number | null>(null)

  const fallbackEvent: MusicalEvent = useMemo(
    () => ({
      id: 'empty-sequence',
      notes: [],
      durationBeats: 1,
      label: 'No event',
    }),
    [],
  )

  const lastStepIndex = sequence.events.length - 1
  const safeStepIndex = clampStepIndex(currentStepIndex, lastStepIndex)
  const currentEvent = sequence.events[safeStepIndex] ?? fallbackEvent
  const isSequenceComplete = !isPlaying && lastStepIndex >= 0 && safeStepIndex === lastStepIndex

  const setCurrentStepIndex = useCallback((stepIndex: number) => {
    const nextStepIndex = clampStepIndex(stepIndex, selectedSequenceRef.current.events.length - 1)
    currentStepIndexRef.current = nextStepIndex
    setCurrentStepIndexState(nextStepIndex)
  }, [])

  const setIsPlaying = useCallback((nextIsPlaying: boolean) => {
    isPlayingRef.current = nextIsPlaying
    setIsPlayingState(nextIsPlaying)
  }, [])

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.25, release: 0.8 },
      }).toDestination()
    }

    return synthRef.current
  }, [])

  const getClick = useCallback(() => {
    if (!clickRef.current) {
      clickRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 },
      }).toDestination()
    }

    return clickRef.current
  }, [])

  const stopScheduler = useCallback(() => {
    schedulerRunIdRef.current += 1

    if (animationFrameIdRef.current !== null) {
      window.cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }, [])

  const triggerClick = useCallback(() => {
    if (audioModeRef.current !== 'note-only') {
      getClick().triggerAttackRelease('C5', '32n')
    }
  }, [getClick])

  const triggerEventNotes = useCallback(
    (event: MusicalEvent) => {
      if (event.notes.length === 0 || audioModeRef.current === 'click-only') return

      const secondsPerBeat = 60 / tempoRef.current
      const durationSeconds = Math.max(0.08, getEventDuration(event) * secondsPerBeat * 0.92)

      getSynth().triggerAttackRelease(event.notes, durationSeconds)
    },
    [getSynth],
  )

  const runSchedulerFrame = useCallback(
    (runId: number, now: number) => {
      if (!isPlayingRef.current || schedulerRunIdRef.current !== runId) return

      const activeSequence = selectedSequenceRef.current
      const totalBeats = getTotalBeats(activeSequence)
      const msPerBeat = 60000 / tempoRef.current
      const elapsedBeats = playbackStartBeatRef.current + (now - playbackStartTimeRef.current) / msPerBeat
      currentBeatRef.current = elapsedBeats

      const currentWholeBeat = Math.floor(elapsedBeats + 0.000001)
      for (let beat = lastMetronomeBeatRef.current + 1; beat <= currentWholeBeat; beat += 1) {
        if (beat >= 0 && beat < totalBeats) {
          triggerClick()
        }
      }
      lastMetronomeBeatRef.current = currentWholeBeat

      if (elapsedBeats >= totalBeats) {
        stopScheduler()
        lastTriggeredStepIndexRef.current = null
        currentBeatRef.current = totalBeats
        setCurrentStepIndex(activeSequence.events.length - 1)
        setIsPlaying(false)
        synthRef.current?.releaseAll()
        return
      }

      const eventIndex = getEventIndexAtBeat(activeSequence, elapsedBeats)
      const event = eventIndex >= 0 ? activeSequence.events[eventIndex] : undefined

      if (!event) {
        stopScheduler()
        setIsPlaying(false)
        return
      }

      if (eventIndex !== currentStepIndexRef.current) {
        setCurrentStepIndex(eventIndex)
      }

      if (eventIndex !== lastTriggeredStepIndexRef.current) {
        lastTriggeredStepIndexRef.current = eventIndex
        triggerEventNotes(event)
      }

      animationFrameIdRef.current = window.requestAnimationFrame((nextNow) => {
        schedulerFrameRef.current(runId, nextNow)
      })
    },
    [setCurrentStepIndex, setIsPlaying, stopScheduler, triggerClick, triggerEventNotes],
  )

  const startSchedulerFromStep = useCallback(
    (stepIndex: number) => {
      const activeSequence = selectedSequenceRef.current
      const lastIndex = activeSequence.events.length - 1

      stopScheduler()

      if (lastIndex < 0) {
        setCurrentStepIndex(0)
        setIsPlaying(false)
        return
      }

      const nextStepIndex = clampStepIndex(stepIndex, lastIndex)
      const startBeat = getEventStartBeat(activeSequence, nextStepIndex)
      const startEvent = activeSequence.events[nextStepIndex]

      currentStepIndexRef.current = nextStepIndex
      currentBeatRef.current = startBeat
      playbackStartBeatRef.current = startBeat
      playbackStartTimeRef.current = performance.now()
      lastMetronomeBeatRef.current = Math.ceil(startBeat) - 1
      lastTriggeredStepIndexRef.current = nextStepIndex
      setCurrentStepIndexState(nextStepIndex)
      setIsPlaying(true)

      triggerEventNotes(startEvent)

      const runId = schedulerRunIdRef.current
      animationFrameIdRef.current = window.requestAnimationFrame((now) => {
        schedulerFrameRef.current(runId, now)
      })
    },
    [setCurrentStepIndex, setIsPlaying, stopScheduler, triggerEventNotes],
  )

  useEffect(() => {
    schedulerFrameRef.current = runSchedulerFrame
  }, [runSchedulerFrame])

  const play = useCallback(async () => {
    const commandId = commandIdRef.current + 1
    commandIdRef.current = commandId

    await Tone.start()

    if (commandIdRef.current !== commandId) return

    const activeSequence = selectedSequenceRef.current
    const lastIndex = activeSequence.events.length - 1
    const nextStepIndex = currentStepIndexRef.current >= lastIndex ? 0 : currentStepIndexRef.current

    startSchedulerFromStep(nextStepIndex)
  }, [startSchedulerFromStep])

  const pause = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    setIsPlaying(false)
  }, [setIsPlaying, stopScheduler])

  const stop = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    lastTriggeredStepIndexRef.current = null
    currentBeatRef.current = 0
    playbackStartBeatRef.current = 0
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }, [setCurrentStepIndex, setIsPlaying, stopScheduler])

  const seek = useCallback(
    (stepIndex: number) => {
      commandIdRef.current += 1
      const wasPlaying = isPlayingRef.current
      const nextStepIndex = clampStepIndex(stepIndex, selectedSequenceRef.current.events.length - 1)

      stopScheduler()
      synthRef.current?.releaseAll()
      lastTriggeredStepIndexRef.current = null
      setCurrentStepIndex(nextStepIndex)

      if (wasPlaying) {
        startSchedulerFromStep(nextStepIndex)
      }
    },
    [setCurrentStepIndex, startSchedulerFromStep, stopScheduler],
  )

  const stepForward = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    setIsPlaying(false)
    setCurrentStepIndex(currentStepIndexRef.current + 1)
  }, [setCurrentStepIndex, setIsPlaying, stopScheduler])

  const stepBackward = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    setIsPlaying(false)
    setCurrentStepIndex(currentStepIndexRef.current - 1)
  }, [setCurrentStepIndex, setIsPlaying, stopScheduler])

  const previewNotes = useCallback(
    async (notes: string[]) => {
      if (notes.length === 0) return

      await Tone.start()
      getSynth().triggerAttackRelease(notes, 0.45)
    },
    [getSynth],
  )

  const setTempo = useCallback(
    (nextTempo: number) => {
      const nextClampedTempo = clampTempo(nextTempo)
      const wasPlaying = isPlayingRef.current

      tempoRef.current = nextClampedTempo
      setTempoState(nextClampedTempo)

      if (wasPlaying) {
        startSchedulerFromStep(currentStepIndexRef.current)
      }
    },
    [startSchedulerFromStep],
  )

  const setAudioMode = useCallback((nextAudioMode: AudioMode) => {
    audioModeRef.current = nextAudioMode
    setAudioModeState(nextAudioMode)
  }, [])

  useEffect(() => {
    selectedSequenceRef.current = sequence
    tempoRef.current = tempo
    audioModeRef.current = audioMode
  }, [audioMode, sequence, tempo])

  useEffect(() => {
    return () => {
      commandIdRef.current += 1
      stopScheduler()
      synthRef.current?.releaseAll()
      synthRef.current?.dispose()
      clickRef.current?.dispose()
      synthRef.current = null
      clickRef.current = null
    }
  }, [stopScheduler])

  return useMemo(
    () => ({
      audioMode,
      currentEvent,
      currentStepIndex: safeStepIndex,
      isPlaying,
      isSequenceComplete,
      lastStepIndex,
      pause,
      play,
      previewNotes,
      seek,
      setAudioMode,
      setTempo,
      stepBackward,
      stepForward,
      stop,
      tempo,
    }),
    [
      audioMode,
      currentEvent,
      isPlaying,
      isSequenceComplete,
      lastStepIndex,
      pause,
      play,
      previewNotes,
      safeStepIndex,
      seek,
      setAudioMode,
      setTempo,
      stepBackward,
      stepForward,
      stop,
      tempo,
    ],
  )
}
