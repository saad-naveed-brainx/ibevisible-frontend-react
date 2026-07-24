import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Guards nested routes: waits while the session is being restored, then either
// renders the child routes or redirects to /login (remembering where the user
// was headed so we can send them back after signing in).
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'restoring') {
    return <div className="app-loading">Loading…</div>
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

// The inverse guard: keeps signed-in users out of the login/signup pages by
// bouncing them to the app.
export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'restoring') {
    return <div className="app-loading">Loading…</div>
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
