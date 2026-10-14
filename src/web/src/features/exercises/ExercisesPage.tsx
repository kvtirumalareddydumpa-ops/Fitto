import { Link, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api, type TrackingType } from '@/lib/api'
import { Chip } from '@/components/ui/Chip'
import { buttonVariants } from '@/components/ui/button-variants'
import { trackingLabels } from './tracking'

const filterTypes = Object.keys(trackingLabels) as TrackingType[]

export function ExercisesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get('type')
  const exercises = useQuery({ queryKey: ['exercises'], queryFn: api.getExercises })
  const visible = exercises.data?.filter((e) => !type || e.trackingType === type) ?? []

  function selectType(value: string | null) {
    setSearchParams(value ? { type: value } : {}, { replace: true })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        <Chip selected={!type} onClick={() => selectType(null)}>
          All
        </Chip>
        {filterTypes.map((t) => (
          <Chip key={t} selected={type === t} onClick={() => selectType(t)}>
            {trackingLabels[t]}
          </Chip>
        ))}
      </div>

      <ul className="divide-line divide-y">
        {visible.map((e) => (
          <li key={e.id}>
            <Link
              to={`/plan/exercises/${e.id}/edit`}
              className="flex min-h-14 flex-col justify-center"
            >
              <span className="font-medium">{e.name}</span>
              <span className="text-muted text-xs">{trackingLabels[e.trackingType]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/plan/exercises/new" className={buttonVariants({ size: 'lg' })}>
        <Plus className="size-5" aria-hidden /> New exercise
      </Link>
    </div>
  )
}
