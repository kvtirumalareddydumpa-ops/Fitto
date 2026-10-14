import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto w-full max-w-md px-5 pt-6 pb-28 md:max-w-2xl">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
