import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import { USER_ID } from '@/lib/demo-user'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export function TodayPage() {
  const navigate = useNavigate()
  const startSession = useMutation({
    mutationFn: () => api.startSession(USER_ID),
    onSuccess: (session) => navigate(`/workout/${session.id}`),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Today</h1>
      <Card className="space-y-4">
        <p className="text-muted">No active program yet. Start a freestyle workout.</p>
        <Button size={'lg'} onClick={() => startSession.mutate()} disabled={startSession.isPending}>
          Start workout
        </Button>
      </Card>
    </div>
  )
}
