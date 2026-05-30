import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Tone from 'tone'
import type {
  AudioMode,
  MusicalEvent,
  MusicalSequence,
  PlaybackPhase,
  TempoStepSize,
  TurnaroundMeasures,
} from '../lib/musicTypes'

interface PlaybackEngineOptions {
  sequence: MusicalSequence
}

const BEATS_PER_MEASURE = 4
const MIN_BEAT_DURATION = 0.001
const TURNAROUND_EVENT: MusicalEvent = {
  id: 'turnaround',
  notes: [],
  durationBeats: 1,
  label: 'Practice Turnaround',
}
const MEASURE_COMPLETION_EVENT: MusicalEvent = {
  id: 'measure-completion',
  notes: [],
  durationBeats: 1,
  label: 'Complete Measure',
}

function clampTempo(tempo: number) {
  return Math.min(Math.max(tempo, 40), 240)
}

function clampStepIndex(stepIndex: number, lastStepIndex: number) {
  if (lastStepIndex < 0) return 0
  return Math.min(Math.max(stepIndex, 0), lastStepIndex)
}

function getEventDuration(event: MusicalEvent) {
  return Math.max(event.durationBeats, MIN_BEAT_DURATION)
}

function getTotalSequenceBeats(sequence: MusicalSequence) {
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

function getTurnaroundBeats(measures: TurnaroundMeasures) {
  return measures * BEATS_PER_MEASURE
}

function getMeasureCompletionBeats(sequenceBeats: number) {
  const beatRemainder = sequenceBeats % BEATS_PER_MEASURE

  if (beatRemainder < 0.000001 || BEATS_PER_MEASURE - beatRemainder < 0.000001) {
    return 0
  }

  return BEATS_PER_MEASURE - beatRemainder
}

export function usePlaybackEngine({ sequence }: PlaybackEngineOptions) {
  const [currentStepIndex, setCurrentStepIndexState] = useState(0)
  const [isPlaying, setIsPlayingState] = useState(false)
  const [tempo, setTempoState] = useState(sequence.defaultTempo)
  const [audioMode, setAudioModeState] = useState<AudioMode>('note-click')
  const [isLoopEnabled, setIsLoopEnabledState] = useState(true)
  const [turnaroundMeasures, setTurnaroundMeasuresState] = useState<TurnaroundMeasures>(1)
  const [tempoStepSize, setTempoStepSizeState] = useState<TempoStepSize>(1)
  const [playbackPhase, setPlaybackPhaseState] = useState<PlaybackPhase>('stopped')

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
  const isLoopEnabledRef = useRef(isLoopEnabled)
  const turnaroundMeasuresRef = useRef(turnaroundMeasures)
  const playbackPhaseRef = useRef<PlaybackPhase>('stopped')
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
  const isInTurnaround = playbackPhase === 'turnaround'
  const isCompletingMeasure = playbackPhase === 'measure-completion'
  const currentEvent = isInTurnaround
    ? TURNAROUND_EVENT
    : isCompletingMeasure
      ? MEASURE_COMPLETION_EVENT
      : sequence.events[safeStepIndex] ?? fallbackEvent
  const activeNotes = useMemo(
    () => (isInTurnaround || isCompletingMeasure ? [] : currentEvent.notes),
    [currentEvent.notes, isCompletingMeasure, isInTurnaround],
  )
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

  const setPlaybackPhase = useCallback((nextPhase: PlaybackPhase) => {
    playbackPhaseRef.current = nextPhase
    setPlaybackPhaseState(nextPhase)
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

  const startSchedulerFromBeat = useCallback(
    (startBeat: number, shouldTriggerCurrentEvent = true) => {
      const activeSequence = selectedSequenceRef.current
      const sequenceBeats = getTotalSequenceBeats(activeSequence)
      const lastIndex = activeSequence.events.length - 1

      stopScheduler()

      if (lastIndex < 0 || sequenceBeats <= 0) {
        setCurrentStepIndex(0)
        setPlaybackPhase('stopped')
        setIsPlaying(false)
        return
      }

      const measureCompletionBeats = getMeasureCompletionBeats(sequenceBeats)
      const turnaroundBeats = isLoopEnabledRef.current ? getTurnaroundBeats(turnaroundMeasuresRef.current) : 0
      const cycleBeats = sequenceBeats + measureCompletionBeats + turnaroundBeats
      const nextBeat = Math.min(Math.max(startBeat, 0), Math.max(cycleBeats - MIN_BEAT_DURATION, 0))
      const startsInMeasureCompletion = nextBeat >= sequenceBeats && nextBeat < sequenceBeats + measureCompletionBeats
      const startsInTurnaround = isLoopEnabledRef.current && nextBeat >= sequenceBeats + measureCompletionBeats
      const nextStepIndex = startsInMeasureCompletion || startsInTurnaround
        ? lastIndex
        : clampStepIndex(getEventIndexAtBeat(activeSequence, nextBeat), lastIndex)

      currentBeatRef.current = nextBeat
      currentStepIndexRef.current = nextStepIndex
      playbackStartBeatRef.current = nextBeat
      playbackStartTimeRef.current = performance.now()
      lastMetronomeBeatRef.current = Math.ceil(nextBeat) - 1
      lastTriggeredStepIndexRef.current =
        shouldTriggerCurrentEvent && !startsInMeasureCompletion && !startsInTurnaround ? nextStepIndex : null

      setCurrentStepIndexState(nextStepIndex)
      setPlaybackPhase(
        startsInTurnaround ? 'turnaround' : startsInMeasureCompletion ? 'measure-completion' : 'sequence',
      )
      setIsPlaying(true)

      if (shouldTriggerCurrentEvent && !startsInMeasureCompletion && !startsInTurnaround) {
        const startEvent = activeSequence.events[nextStepIndex]
        if (startEvent) {
          triggerEventNotes(startEvent)
        }
      }

      const runId = schedulerRunIdRef.current
      animationFrameIdRef.current = window.requestAnimationFrame((now) => {
        schedulerFrameRef.current(runId, now)
      })
    },
    [setCurrentStepIndex, setIsPlaying, setPlaybackPhase, stopScheduler, triggerEventNotes],
  )

  const finishPlayback = useCallback(
    (activeSequence: MusicalSequence) => {
      stopScheduler()
      synthRef.current?.releaseAll()
      lastTriggeredStepIndexRef.current = null
      currentBeatRef.current = getTotalSequenceBeats(activeSequence)
      setCurrentStepIndex(activeSequence.events.length - 1)
      setPlaybackPhase('stopped')
      setIsPlaying(false)
    },
    [setCurrentStepIndex, setIsPlaying, setPlaybackPhase, stopScheduler],
  )

  const runSchedulerFrame = useCallback(
    (runId: number, now: number) => {
      if (!isPlayingRef.current || schedulerRunIdRef.current !== runId) return

      const activeSequence = selectedSequenceRef.current
      const sequenceBeats = getTotalSequenceBeats(activeSequence)
      const measureCompletionBeats = getMeasureCompletionBeats(sequenceBeats)
      const turnaroundBeats = isLoopEnabledRef.current ? getTurnaroundBeats(turnaroundMeasuresRef.current) : 0
      const turnaroundStartBeat = sequenceBeats + measureCompletionBeats
      const cycleBeats = turnaroundStartBeat + turnaroundBeats
      const msPerBeat = 60000 / tempoRef.current
      const elapsedBeats = playbackStartBeatRef.current + (now - playbackStartTimeRef.current) / msPerBeat

      if (sequenceBeats <= 0 || cycleBeats <= 0) {
        finishPlayback(activeSequence)
        return
      }

      const currentWholeBeat = Math.floor(elapsedBeats + 0.000001)
      for (let beat = lastMetronomeBeatRef.current + 1; beat <= currentWholeBeat; beat += 1) {
        if (beat >= 0 && beat < cycleBeats) {
          triggerClick()
        }
      }
      lastMetronomeBeatRef.current = currentWholeBeat

      if (elapsedBeats >= cycleBeats) {
        if (!isLoopEnabledRef.current) {
          finishPlayback(activeSequence)
          return
        }

        const loopedBeat = 0
        currentBeatRef.current = loopedBeat
        playbackStartBeatRef.current = loopedBeat
        playbackStartTimeRef.current = now
        lastMetronomeBeatRef.current = 0
        lastTriggeredStepIndexRef.current = null
        setPlaybackPhase('sequence')
        setCurrentStepIndex(0)
        triggerClick()

        const firstEvent = activeSequence.events[0]
        if (firstEvent) {
          lastTriggeredStepIndexRef.current = 0
          triggerEventNotes(firstEvent)
        }
      } else {
        currentBeatRef.current = elapsedBeats

        if (elapsedBeats >= sequenceBeats && elapsedBeats < turnaroundStartBeat) {
          if (playbackPhaseRef.current !== 'measure-completion') {
            synthRef.current?.releaseAll()
            lastTriggeredStepIndexRef.current = null
            setPlaybackPhase('measure-completion')
            setCurrentStepIndex(activeSequence.events.length - 1)
          }
        } else if (isLoopEnabledRef.current && elapsedBeats >= turnaroundStartBeat) {
          if (playbackPhaseRef.current !== 'turnaround') {
            synthRef.current?.releaseAll()
            lastTriggeredStepIndexRef.current = null
            setPlaybackPhase('turnaround')
            setCurrentStepIndex(activeSequence.events.length - 1)
          }
        } else {
          if (playbackPhaseRef.current !== 'sequence') {
            setPlaybackPhase('sequence')
          }

          const eventIndex = getEventIndexAtBeat(activeSequence, elapsedBeats)
          const event = eventIndex >= 0 ? activeSequence.events[eventIndex] : undefined

          if (!event) {
            finishPlayback(activeSequence)
            return
          }

          if (eventIndex !== currentStepIndexRef.current) {
            setCurrentStepIndex(eventIndex)
          }

          if (eventIndex !== lastTriggeredStepIndexRef.current) {
            lastTriggeredStepIndexRef.current = eventIndex
            triggerEventNotes(event)
          }
        }
      }

      animationFrameIdRef.current = window.requestAnimationFrame((nextNow) => {
        schedulerFrameRef.current(runId, nextNow)
      })
    },
    [finishPlayback, setCurrentStepIndex, setPlaybackPhase, triggerClick, triggerEventNotes],
  )

  useEffect(() => {
    schedulerFrameRef.current = runSchedulerFrame
  }, [runSchedulerFrame])

  const startSchedulerFromStep = useCallback(
    (stepIndex: number, shouldTriggerCurrentEvent = true) => {
      const startBeat = getEventStartBeat(selectedSequenceRef.current, stepIndex)
      startSchedulerFromBeat(startBeat, shouldTriggerCurrentEvent)
    },
    [startSchedulerFromBeat],
  )

  const play = useCallback(async () => {
    const commandId = commandIdRef.current + 1
    commandIdRef.current = commandId

    await Tone.start()

    if (commandIdRef.current !== commandId) return

    const activeSequence = selectedSequenceRef.current
    const lastIndex = activeSequence.events.length - 1

    if (lastIndex < 0) return

    if (playbackPhaseRef.current === 'turnaround' || playbackPhaseRef.current === 'measure-completion') {
      startSchedulerFromBeat(currentBeatRef.current, false)
      return
    }

    const nextStepIndex = currentStepIndexRef.current >= lastIndex ? 0 : currentStepIndexRef.current
    startSchedulerFromStep(nextStepIndex)
  }, [startSchedulerFromBeat, startSchedulerFromStep])

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
    setPlaybackPhase('stopped')
    setIsPlaying(false)
  }, [setCurrentStepIndex, setIsPlaying, setPlaybackPhase, stopScheduler])

  const seek = useCallback(
    (stepIndex: number) => {
      commandIdRef.current += 1
      const wasPlaying = isPlayingRef.current
      const nextStepIndex = clampStepIndex(stepIndex, selectedSequenceRef.current.events.length - 1)

      stopScheduler()
      synthRef.current?.releaseAll()
      lastTriggeredStepIndexRef.current = null
      setCurrentStepIndex(nextStepIndex)
      setPlaybackPhase('sequence')
      currentBeatRef.current = getEventStartBeat(selectedSequenceRef.current, nextStepIndex)

      if (wasPlaying) {
        startSchedulerFromStep(nextStepIndex)
      }
    },
    [setCurrentStepIndex, setPlaybackPhase, startSchedulerFromStep, stopScheduler],
  )

  const stepForward = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    setIsPlaying(false)
    setPlaybackPhase('sequence')
    setCurrentStepIndex(playbackPhaseRef.current === 'sequence' ? currentStepIndexRef.current + 1 : selectedSequenceRef.current.events.length - 1)
  }, [setCurrentStepIndex, setIsPlaying, setPlaybackPhase, stopScheduler])

  const stepBackward = useCallback(() => {
    commandIdRef.current += 1
    stopScheduler()
    synthRef.current?.releaseAll()
    setIsPlaying(false)
    setPlaybackPhase('sequence')
    setCurrentStepIndex(playbackPhaseRef.current === 'sequence' ? currentStepIndexRef.current - 1 : selectedSequenceRef.current.events.length - 1)
  }, [setCurrentStepIndex, setIsPlaying, setPlaybackPhase, stopScheduler])

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
        startSchedulerFromBeat(currentBeatRef.current, false)
      }
    },
    [startSchedulerFromBeat],
  )

  const adjustTempo = useCallback(
    (direction: -1 | 1) => {
      setTempo(tempoRef.current + direction * tempoStepSize)
    },
    [setTempo, tempoStepSize],
  )

  const setAudioMode = useCallback((nextAudioMode: AudioMode) => {
    audioModeRef.current = nextAudioMode
    setAudioModeState(nextAudioMode)
  }, [])

  const setIsLoopEnabled = useCallback((nextIsLoopEnabled: boolean) => {
    isLoopEnabledRef.current = nextIsLoopEnabled
    setIsLoopEnabledState(nextIsLoopEnabled)
  }, [])

  const setTurnaroundMeasures = useCallback((nextTurnaroundMeasures: TurnaroundMeasures) => {
    turnaroundMeasuresRef.current = nextTurnaroundMeasures
    setTurnaroundMeasuresState(nextTurnaroundMeasures)
  }, [])

  const setTempoStepSize = useCallback((nextTempoStepSize: TempoStepSize) => {
    setTempoStepSizeState(nextTempoStepSize)
  }, [])

  useEffect(() => {
    selectedSequenceRef.current = sequence
    tempoRef.current = tempo
    audioModeRef.current = audioMode
    isLoopEnabledRef.current = isLoopEnabled
    turnaroundMeasuresRef.current = turnaroundMeasures
  }, [audioMode, isLoopEnabled, sequence, tempo, turnaroundMeasures])

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
      activeNotes,
      adjustTempo,
      audioMode,
      currentEvent,
      currentStepIndex: safeStepIndex,
      isLoopEnabled,
      isPlaying,
      isSequenceComplete,
      lastStepIndex,
      pause,
      play,
      playbackPhase,
      previewNotes,
      seek,
      setAudioMode,
      setIsLoopEnabled,
      setTempo,
      setTempoStepSize,
      setTurnaroundMeasures,
      stepBackward,
      stepForward,
      stop,
      tempo,
      tempoStepSize,
      turnaroundMeasures,
    }),
    [
      activeNotes,
      adjustTempo,
      audioMode,
      currentEvent,
      isLoopEnabled,
      isPlaying,
      isSequenceComplete,
      lastStepIndex,
      pause,
      play,
      playbackPhase,
      previewNotes,
      safeStepIndex,
      seek,
      setAudioMode,
      setIsLoopEnabled,
      setTempo,
      setTempoStepSize,
      setTurnaroundMeasures,
      stepBackward,
      stepForward,
      stop,
      tempo,
      tempoStepSize,
      turnaroundMeasures,
    ],
  )
}
