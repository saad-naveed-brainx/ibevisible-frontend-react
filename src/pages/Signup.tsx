import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/auth'
import { AuthShell } from '../components/AuthShell'

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      await signup({
        email,
        password,
        fullName: fullName.trim() || undefined,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to create account. Try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <h1>Create account</h1>
      <p className="auth-intro">Get started with iBeVisible.</p>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Alex Rivera"
            value={fullName}
            disabled={submitting}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            maxLength={72}
            value={password}
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-alt">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  )
}
