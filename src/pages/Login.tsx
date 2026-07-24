import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/auth'
import { AuthShell } from '../components/AuthShell'

interface LocationState {
  from?: { pathname: string }
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to sign in. Try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <h1>Sign in</h1>
      <p className="auth-intro">Welcome back to iBeVisible.</p>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            required
            value={email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-alt">
        Don’t have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthShell>
  )
}
