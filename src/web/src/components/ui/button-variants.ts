import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-bold transition ' +
    'disabled:pointer-events-none disabled:opacity-50 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary-hover',
        secondary: 'bg-surface-raised text-fg hover:bg-line-strong',
        ghost: 'border border-dashed border-line-strong text-fg hover:bg-surface',
      },
      size: {
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 w-full px-5 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
