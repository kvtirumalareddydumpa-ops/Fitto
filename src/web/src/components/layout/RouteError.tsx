// RouteError.tsx
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong'

  return (
    <div className="mx-auto max-w-md space-y-3 p-8 text-center">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted">{message}</p>
      <Link to="/" className="text-primary">
        Go to Today
      </Link>
    </div>
  )
}
