import { createBrowserRouter, Navigate } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { NotFoundPage } from '@/components/layout/NotFoundPage'
import { RouteError } from '@/components/layout/RouteError'
import { TodayPage } from '@/features/workouts/TodayPage'
import { WorkoutPage } from '@/features/workouts/WorkoutPage'
import { PlanLayout } from '@/features/programs/PlanLayout'
import { ProgramsPage } from '@/features/programs/ProgramsPage'
import { ExercisesPage } from '@/features/exercises/ExercisesPage'
import { ExerciseFormPage } from '@/features/exercises/ExerciseFormPage'
import { BodyPage } from '@/features/body/BodyPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        // screens WITH the tab bar
        element: <AppLayout />,
        children: [
          { index: true, element: <TodayPage /> },
          {
            path: 'plan',
            element: <PlanLayout />,
            children: [
              { index: true, element: <Navigate to="programs" replace /> },
              { path: 'programs', element: <ProgramsPage /> },
              { path: 'exercises', element: <ExercisesPage /> },
            ],
          },
          {
            path: 'records',
            lazy: async () => {
              const { RecordsPage } = await import('@/features/records/RecordsPage')
              return { Component: RecordsPage }
            },
          },
          { path: 'body', element: <BodyPage /> },
        ],
      },
      // full-screen focused screens, WITHOUT the tab bar
      { path: 'workout/:sessionId', element: <WorkoutPage /> },
      { path: 'plan/exercises/new', element: <ExerciseFormPage /> },
      { path: 'plan/exercises/:exerciseId/edit', element: <ExerciseFormPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
