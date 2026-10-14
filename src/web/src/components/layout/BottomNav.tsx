import { cn } from '@/lib/cn'
import { CalendarDays, House, Trophy, User } from 'lucide-react'
import { NavLink } from 'react-router'

const tabs = [
  { to: '/', label: 'Today', icon: House, end: true },
  { to: '/plan', label: 'Plan', icon: CalendarDays, end: false },
  { to: '/records', label: 'Records', icon: Trophy, end: false },
  { to: '/body', label: 'Body', icon: User, end: false },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="border-line bg-surface/95 fixed inset-x-0 bottom-0 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 md:max-w-2xl">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-xs',
                  isActive ? 'text-primary font-bold' : 'text-muted hover:text-fg font-medium',
                )
              }
            >
              <Icon className="size-6" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
