import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/cn'

const sections = [
  { to: 'programs', label: 'Programs' },
  { to: 'exercises', label: 'Exercies' },
]

export function PlanLayout() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold tracking-tight">Plan</h1>
      <nav
        aria-label="Plan sections"
        className="rounded-control border-line bg-surface grid grid-cols-2 gap-1 border p-1"
      >
        {sections.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center justify-center rounded-[9px] text-sm',
                isActive ? 'bg-surface-raised text-fg font-bold' : 'text-muted font-medium',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
