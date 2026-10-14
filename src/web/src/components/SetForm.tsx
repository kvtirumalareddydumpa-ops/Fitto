import { api, type Exercise, type LogSetResult, type NewSet } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Field } from './ui/Field'

export function SetForm({
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
