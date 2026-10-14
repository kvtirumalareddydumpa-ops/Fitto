import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { api, type LogSetResult, type NewSet } from '@/lib/api'
import { USER_ID } from '@/lib/demo-user'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { recordLabels } from '@/features/records/labels'
import { SetForm } from '@/components/SetForm'
import { describe } from './describe-set'

interface LoggedSetView {
  id: number
  exerciseId: number
  exerciseName: string
  summary: string
}

export function WorkoutPage() {
  const { sessionId } = useParams()
  const id = Number(sessionId)
  const queryClient = useQueryClient()
  const [loggedSets, setLoggedSets] = useState<LoggedSetView[]>([])
  const [prMessage, setPrMessage] = useState<string | null>(null)
  const exercises = useQuery({ queryKey: ['exercises'], queryFn: api.getExercises })

  if (!Number.isInteger(id) || id <= 0) return <Navigate to="/" replace />

  const exerciseName = (exerciseId: number) =>
    exercises.data?.find((e) => e.id === exerciseId)?.name ?? `#${exerciseId}`

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
    <div className="mx-auto min-h-dvh w-full max-w-md md:max-w-2xl">
      <header className="border-line flex items-center gap-2 border-b px-3 py-3">
        <Link
          to="/"
          aria-label="Back to Today"
          className={buttonVariants({ variant: 'secondary', size: 'icon' })}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="font-display flex-1 text-lg font-bold">Workout #{id}</h1>
        <Link to="/records" className={buttonVariants({ variant: 'secondary' })}>
          Finish
        </Link>
      </header>

      <main className="space-y-4 p-5">
        {prMessage && (
          <div
            role="status"
            className="rounded-control border-pr/40 bg-pr-surface text-pr border p-3"
          >
            🏆 {prMessage}
          </div>
        )}
        {exercises.data && (
          <Card>
            <SetForm
              exercises={exercises.data}
              sessionId={id}
              nextSetNumber={(exId) => loggedSets.filter((s) => s.exerciseId === exId).length + 1}
              onLogged={handleLogged}
            />
          </Card>
        )}
        <ul className="space-y-1 text-sm">
          {loggedSets.map((s) => (
            <li
              key={s.id}
              className="rounded-control bg-surface-raised flex justify-between px-3 py-2"
            >
              <span>{s.exerciseName}</span>
              <span className="text-muted">{s.summary}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
