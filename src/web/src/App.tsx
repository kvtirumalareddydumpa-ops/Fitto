import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Exercise, LogSetResult, NewSet } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from './components/ui/Button'
import { Field } from './components/ui/Field'

const USER_ID = 1 // demo user until we add login

const recordLabels: Record<string, string> = {
  EstimatedOneRepMax: 'Est. 1RM (kg)',
  MaxSetVolume: 'Best set volume (kg)',
  MaxReps: 'Max reps',
  LongestDuration: 'Longest hold (s)',
  LongestDistance: 'Longest distance (m)',
}

interface LoggedSetView {
  id: number
  exerciseId: number
  exerciseName: string
  summary: string
}

function describe(set: NewSet) {
  const parts: string[] = []
  if (set.weightKg != null) parts.push(`${set.weightKg} kg`)
  if (set.reps != null) parts.push(`${set.reps} reps`)
  if (set.distanceMeters != null) parts.push(`${set.distanceMeters} m`)
  if (set.durationSeconds != null) parts.push(`${set.durationSeconds} s`)
  return parts.join(' · ')
}

export default function App() {
  const queryClient = useQueryClient()
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [loggedSets, setLoggedSets] = useState<LoggedSetView[]>([])
  const [prMessage, setPrMessage] = useState<string | null>(null)

  const exercises = useQuery({ queryKey: ['exercises'], queryFn: api.getExercises })
  const records = useQuery({
    queryKey: ['records', USER_ID],
    queryFn: () => api.getRecords(USER_ID),
  })

  const startSession = useMutation({
    mutationFn: () => api.startSession(USER_ID),
    onSuccess: (s) => {
      setSessionId(s.id)
      setLoggedSets([])
      setPrMessage(null)
    },
  })

  const exerciseName = (id: number) => exercises.data?.find((e) => e.id === id)?.name ?? `#${id}`

  function handleLogged(result: LogSetResult, set: NewSet) {
    setLoggedSets((prev) => [
      ...prev,
      {
        id: result.id,
        exerciseId: set.exerciseId,
        exerciseName: exerciseName(set.exerciseId),
        summary: describe(set),
      },
    ])
    setPrMessage(
      result.newPersonalRecords.length
        ? 'New PR! ' +
            result.newPersonalRecords
              .map((p) => `${recordLabels[p.recordType] ?? p.recordType}: ${p.value}`)
              .join(', ')
        : null,
    )
    queryClient.invalidateQueries({ queryKey: ['records', USER_ID] })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-md space-y-6 px-5 py-6 md:max-w-2xl md:px-8">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight">Fitto</h1>
          <Button onClick={() => startSession.mutate()} disabled={startSession.isPending}>
            {sessionId ? 'New workout' : 'Start workout'}
          </Button>
        </header>

        {exercises.isError && (
          <p className="text-danger">Can't reach the API. Is dotnet watch running?</p>
        )}

        {prMessage && (
          <div className="border-pr/40 bg-pr-surface text-pr rounded-lg border">🏆 {prMessage}</div>
        )}

        {sessionId && exercises.data && (
          <Card className="space-y-4">
            <h2 className="font-semibold">Workout #{sessionId}</h2>
            <SetForm
              exercises={exercises.data}
              sessionId={sessionId}
              nextSetNumber={(id) => loggedSets.filter((s) => s.exerciseId === id).length + 1}
              onLogged={handleLogged}
            />
            <ul className="space-y-1 text-sm">
              {loggedSets.map((s) => (
                <li key={s.id} className="bg-surface-raised flex justify-between rounded px-3 py-2">
                  <span>{s.exerciseName}</span>
                  <span className="text-muted">{s.summary}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <h2 className="mb-3 font-semibold">Personal records</h2>
          {records.isLoading && <p className="text-muted">Loading…</p>}
          {records.data?.length === 0 && <p className="text-muted">No records yet. Log a set!</p>}
          <ul className="space-y-1 text-sm">
            {records.data?.map((r) => (
              <li key={r.id} className="bg-surface-raised flex justify-between rounded px-3 py-2">
                <span>
                  {exerciseName(r.exerciseId)} · {recordLabels[r.recordType] ?? r.recordType}
                </span>
                <span className="text-primary font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function SetForm({
  exercises,
  sessionId,
  nextSetNumber,
  onLogged,
}: {
  exercises: Exercise[]
  sessionId: number
  nextSetNumber: (exerciseId: number) => number
  onLogged: (result: LogSetResult, set: NewSet) => void
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? 0)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [seconds, setSeconds] = useState('')
  const [distance, setDistance] = useState('')

  const type = exercises.find((e) => e.id === exerciseId)?.trackingType
  const num = (v: string) => (v === '' ? undefined : Number(v))

  const logSet = useMutation({
    mutationFn: (set: NewSet) => api.logSet(sessionId, set),
    onSuccess: (result, set) => {
      onLogged(result, set)
      setReps('')
      setSeconds('')
      setDistance('')
    },
  })

  function submit() {
    logSet.mutate({
      exerciseId,
      setNumber: nextSetNumber(exerciseId),
      weightKg: type === 'WeightReps' ? num(weight) : undefined,
      reps: type === 'WeightReps' || type === 'BodyweightReps' ? num(reps) : undefined,
      durationSeconds: type === 'TimeHold' || type === 'DistanceTime' ? num(seconds) : undefined,
      distanceMeters: type === 'DistanceTime' ? num(distance) : undefined,
    })
  }

  return (
    <div className="space-y-3">
      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(Number(e.target.value))}
        className="bg-surface-raised w-full rounded-lg px-3 py-2"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        {type === 'WeightReps' && (
          <Field
            label="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          ></Field>
        )}
        {(type === 'WeightReps' || type === 'BodyweightReps') && (
          <Field label="Reps" value={reps} onChange={(e) => setReps(e.target.value)}></Field>
        )}
        {type === 'DistanceTime' && (
          <Field
            label="Distance (m)"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          ></Field>
        )}
        {(type === 'DistanceTime' || type === 'TimeHold') && (
          <Field
            label="Time (seconds)"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          ></Field>
        )}
      </div>

      <Button onClick={submit} disabled={logSet.isPending} size="lg" variant="secondary">
        Log set
      </Button>
      {logSet.isError && <p className="text-danger text-sm">{logSet.error.message}</p>}
    </div>
  )
}
