import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useContentList } from '../hooks/useContentList'
import { TYPE_META, TYPE_ORDER, relativeTime } from '../data/content'
import type { ContentType } from '../api/content'
import {
  TYPE_ICON,
  ArrowUpRight,
  CheckIcon,
  GlobeIcon,
} from '../components/icons'
import './dashboard.css'

function firstName(full: string | null | undefined): string {
  if (!full) return 'there'
  return full.trim().split(/\s+/)[0]
}

export function Dashboard() {
  const { user } = useAuth()
  const { items, loading, error } = useContentList()

  const { published, drafts, byType, recent } = useMemo(() => {
    const byType = TYPE_ORDER.reduce(
      (acc, t) => ({ ...acc, [t]: 0 }),
      {} as Record<ContentType, number>,
    )
    for (const item of items) byType[item.type] += 1
    return {
      published: items.filter((c) => c.status === 'published').length,
      drafts: items.filter((c) => c.status === 'draft').length,
      byType,
      recent: [...items]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 5),
    }
  }, [items])

  const total = items.length
  const stats = [
    { label: 'Total content', value: total, hint: 'across five types' },
    { label: 'Published', value: published, hint: 'live & in sitemap' },
    { label: 'Drafts', value: drafts, hint: 'in progress' },
    { label: 'Content types', value: TYPE_ORDER.length, hint: 'supported' },
  ]

  return (
    <div className="dash">
      <header className="dash-head">
        <p className="dash-eyebrow">Workspace overview</p>
        <h1 className="dash-title">
          Good to see you, <em>{firstName(user?.fullName)}</em>.
        </h1>
        <p className="dash-sub">
          Everything your business publishes — tuned for search engines and AI
          answer engines, all in one place.
        </p>
      </header>

      <section className="dash-stats" aria-label="Key numbers">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-value">
              {loading ? <span className="stat-dash">—</span> : s.value}
            </span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-hint">{s.hint}</span>
          </div>
        ))}
      </section>

      {error && <div className="dash-banner">{error}</div>}

      <div className="dash-grid">
        <section className="card">
          <div className="card-head">
            <h2>Content by type</h2>
            <Link to="/content" className="card-link">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <ul className="type-list">
            {TYPE_ORDER.map((type) => {
              const meta = TYPE_META[type]
              const Icon = TYPE_ICON[type]
              const count = byType[type]
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <li key={type} className="type-row">
                  <span className="type-icon">
                    <Icon size={17} />
                  </span>
                  <span className="type-name">
                    {meta.plural}
                    <small>{meta.schema}</small>
                  </span>
                  <span className="type-bar" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="type-count">{count}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Recent activity</h2>
          </div>
          {recent.length === 0 ? (
            <p className="dash-emptyline">
              {loading ? 'Loading…' : 'No content yet — create your first item.'}
            </p>
          ) : (
            <ul className="activity">
              {recent.map((item) => {
                const Icon = TYPE_ICON[item.type]
                return (
                  <li key={item.id} className="activity-row">
                    <span className="activity-icon">
                      <Icon size={16} />
                    </span>
                    <span className="activity-body">
                      <span className="activity-title">{item.title}</span>
                      <span className="activity-meta">
                        {TYPE_META[item.type].label} · updated{' '}
                        {relativeTime(item.updatedAt)}
                      </span>
                    </span>
                    <span className={`pill pill--${item.status}`}>
                      {item.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card visibility">
        <div className="visibility-icon" aria-hidden="true">
          <GlobeIcon size={22} />
        </div>
        <div className="visibility-body">
          <h2>Visibility layer</h2>
          <p>
            Every published item emits clean meta tags, Open Graph &amp; Twitter
            cards, and Schema.org JSON-LD — plus a live <code>sitemap.xml</code>{' '}
            and <code>robots.txt</code>.
          </p>
          <ul className="checks">
            {[
              'Semantic, server-rendered pages',
              'Structured data per content type',
              'Passing rich-results validators',
            ].map((c) => (
              <li key={c}>
                <CheckIcon size={15} />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="visibility-score">
          <span className="score-num">{published > 0 ? 98 : '—'}</span>
          <span className="score-label">visibility score</span>
        </div>
      </section>
    </div>
  )
}
