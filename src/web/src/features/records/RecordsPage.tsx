import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { USER_ID } from '@/lib/demo-user'
import { useQuery } from '@tanstack/react-query'
import { recordLabels } from './labels'

export function RecordsPage() {
  const records = useQuery({
    queryKey: ['records', USER_ID],
    queryFn: () => api.getRecords(USER_ID),
  })

  const exercises = useQuery({ queryKey: ['exercises'], queryFn: api.getExercises })
  const exerciseName = (id: number) => exercises.data?.find((e) => e.id === id)?.name ?? `#${id}`

  return (
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
  )
}
