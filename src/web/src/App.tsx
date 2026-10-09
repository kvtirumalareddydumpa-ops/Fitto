import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Exercise, LogSetResult, NewSet } from './api'

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

  const exerciseName = (id: number) =>
    exercises.data?.find((e) => e.id === id)?.name ?? `#${id}`

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Fitto</h1>
          <button
            onClick={() => startSession.mutate()}
            disabled={startSession.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
          >
            {sessionId ? 'New workout' : 'Start workout'}
          </button>
        </header>

        {exercises.isError && (
          <p className="text-red-400">Can't reach the API. Is dotnet watch running?</p>
        )}

        {prMessage && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-300">
            🏆 {prMessage}
          </div>
        )}

        {sessionId && exercises.data && (
          <section className="space-y-4 rounded-xl bg-slate-900 p-5">
            <h2 className="font-semibold">Workout #{sessionId}</h2>
            <SetForm
              exercises={exercises.data}
              sessionId={sessionId}
              nextSetNumber={(id) => loggedSets.filter((s) => s.exerciseId === id).length + 1}
              onLogged={handleLogged}
            />
            <ul className="space-y-1 text-sm">
              {loggedSets.map((s) => (
                <li key={s.id} className="flex justify-between rounded bg-slate-800 px-3 py-2">
                  <span>{s.exerciseName}</span>
                  <span className="text-slate-400">{s.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl bg-slate-900 p-5">
          <h2 className="mb-3 font-semibold">Personal records</h2>
          {records.isLoading && <p className="text-slate-400">Loading…</p>}
          {records.data?.length === 0 && (
            <p className="text-slate-400">No records yet. Log a set!</p>
          )}
          <ul className="space-y-1 text-sm">
            {records.data?.map((r) => (
              <li key={r.id} className="flex justify-between rounded bg-slate-800 px-3 py-2">
                <span>
                  {exerciseName(r.exerciseId)} · {recordLabels[r.recordType] ?? r.recordType}
                </span>
                <span className="font-semibold text-emerald-400">{r.value}</span>
              </li>
            ))}
          </ul>
        </section>
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
        className="w-full rounded-lg bg-slate-800 px-3 py-2"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        {type === 'WeightReps' && <Field label="Weight (kg)" value={weight} onChange={setWeight} />}
        {(type === 'WeightReps' || type === 'BodyweightReps') && (
          <Field label="Reps" value={reps} onChange={setReps} />
        )}
        {type === 'DistanceTime' && (
          <Field label="Distance (m)" value={distance} onChange={setDistance} />
        )}
        {(type === 'DistanceTime' || type === 'TimeHold') && (
          <Field label="Time (seconds)" value={seconds} onChange={setSeconds} />
        )}
      </div>

      <button
        onClick={submit}
        disabled={logSet.isPending}
        className="w-full rounded-lg bg-slate-100 py-2 font-medium text-slate-900 hover:bg-white disabled:opacity-50"
      >
        Log set
      </button>
      {logSet.isError && <p className="text-sm text-red-400">{logSet.error.message}</p>}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  )
}