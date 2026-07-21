import { useEffect, useState } from 'react'
import { getHealth, type HealthStatus } from './api/client'
import './App.css'

type Status = 'loading' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkHealth() {
    setStatus('loading')
    setError(null)
    try {
      const data = await getHealth()
      setHealth(data)
      setStatus('ok')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  useEffect(() => {
    void checkHealth()
  }, [])

  return (
    <main className="app">
      <h1>iBeVisible</h1>
      <p className="subtitle">POC — frontend &amp; backend wiring check</p>

      <section className="card">
        <h2>Backend health</h2>
        <p className={`status status--${status}`}>
          <span className="dot" aria-hidden />
          {status === 'loading' && 'Checking…'}
          {status === 'ok' && 'Connected'}
          {status === 'error' && 'Unavailable'}
        </p>

        {status === 'ok' && health && (
          <dl className="details">
            <dt>Service</dt>
            <dd>{health.service}</dd>
            <dt>Status</dt>
            <dd>{health.status}</dd>
            <dt>Uptime</dt>
            <dd>{health.uptime.toFixed(1)}s</dd>
            <dt>Checked at</dt>
            <dd>{new Date(health.timestamp).toLocaleTimeString()}</dd>
          </dl>
        )}

        {status === 'error' && (
          <p className="error">
            {error}
            <br />
            Is the backend running on <code>http://localhost:3000</code>?
          </p>
        )}

        <button onClick={() => void checkHealth()} disabled={status === 'loading'}>
          Re-check
        </button>
      </section>
    </main>
  )
}

export default App
