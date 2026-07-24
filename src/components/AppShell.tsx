import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  GridIcon,
  LayersIcon,
  GlobeIcon,
  SparkleIcon,
  LogoutIcon,
  PlusIcon,
} from './icons'
import './app-shell.css'

const NAV = [
  { to: '/', label: 'Dashboard', icon: GridIcon, end: true },
  { to: '/content', label: 'Content', icon: LayersIcon, end: false },
]

const NAV_SOON = [
  { label: 'Visibility', icon: GlobeIcon },
  { label: 'AI Assist', icon: SparkleIcon },
]

function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      {open && <div className="shell-scrim" onClick={() => setOpen(false)} />}

      <aside className={`shell-sidebar${open ? ' is-open' : ''}`}>
        <div className="shell-brand">
          <span className="shell-mark" aria-hidden="true">
            iB
          </span>
          <span className="shell-wordmark">
            iBe<em>Visible</em>
          </span>
        </div>

        <nav className="shell-nav" aria-label="Primary">
          <p className="shell-navlabel">Workspace</p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="shell-navitem"
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <p className="shell-navlabel">Coming soon</p>
          {NAV_SOON.map(({ label, icon: Icon }) => (
            <span key={label} className="shell-navitem is-disabled">
              <Icon size={18} />
              <span>{label}</span>
              <em className="shell-soon">Soon</em>
            </span>
          ))}
        </nav>

        <div className="shell-user">
          <span className="shell-avatar" aria-hidden="true">
            {initials(user?.fullName, user?.email ?? '').toUpperCase() || 'U'}
          </span>
          <span className="shell-usermeta">
            <strong>{user?.fullName ?? 'Your account'}</strong>
            <small>{user?.email}</small>
          </span>
          <button
            className="shell-iconbtn"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            <LogoutIcon size={17} />
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <button
            className="shell-burger"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="shell-org">
            <span className="shell-orgdot" aria-hidden="true" />
            <span className="shell-orgname">Northlight Studio</span>
            <span className="shell-orgdomain">northlight.studio</span>
          </div>

          <Link to="/content/new" className="btn btn--primary shell-new">
            <PlusIcon size={16} />
            New content
          </Link>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
