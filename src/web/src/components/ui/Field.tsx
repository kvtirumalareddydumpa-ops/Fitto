import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type FieldProps = ComponentProps<'input'> & { label: string }

export function Field({ label, id, className, ...props }: FieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-muted text-sm font-bold">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'rounded-control border-line-strong bg-surface text-fg h-12 border px-3.5',
          'placeholder:text-muted/70 focus:ring-primary outline-none focus:ring-2',
          className,
        )}
        {...props}
      />
    </div>
  )
}
