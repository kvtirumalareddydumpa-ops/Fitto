import { Link, useParams } from 'react-router'

export function ExerciseFormPage() {
  const { exerciseId } = useParams()
  const isEdit = exerciseId !== undefined

  return (
    <div className="mx-auto min-h-dvh max-w-md p-5">
      <Link to="/plan/exercises" className="text-primary">
        Cancel
      </Link>
      <h1 className="font-display mt-4 text-2xl font-bold">
        {isEdit ? `Edit exercise #${exerciseId}` : 'New exercise'}
      </h1>
      <p className="text-muted mt-2">The form comes in Phase 5.</p>
    </div>
  )
}
