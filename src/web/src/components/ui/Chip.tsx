import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type ChipProps = ComponentProps<'button'> & { selected?: boolean }

export function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'h-9 shrink-0 rounded-full px-3.5 text-sm transition-colors',
        selected
          ? 'bg-fg text-page font-bold'
          : 'border-line-strong text-fg/80 hover:bg-surface border font-medium',
        className,
      )}
      {...props}
    />
  )
}
