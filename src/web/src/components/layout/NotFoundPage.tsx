// NotFoundPage.tsx
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-8 text-center">
      <h1 className="font-display text-2xl font-bold">Page not found</h1>
      <Link to="/" className="text-primary">
        Go to Today
      </Link>
    </div>
  )
}
