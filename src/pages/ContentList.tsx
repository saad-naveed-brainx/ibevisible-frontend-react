import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/auth'
import {
  deleteContent,
  publishContent,
  unpublishContent,
  type ContentListItem,
  type ContentStatus,
  type ContentType,
} from '../api/content'
import { useContentList } from '../hooks/useContentList'
import { TYPE_META, TYPE_ORDER, relativeTime } from '../data/content'
import { TYPE_ICON, SearchIcon, PlusIcon, CheckIcon } from '../components/icons'
import './content-list.css'

type TypeFilter = ContentType | 'all'
type StatusFilter = ContentStatus | 'all'

// The list endpoint returns condensed rows; mutations return the full item, so
// we project the fields the list cares about back onto the row.
function toRow(item: {
  id: string
  type: ContentType
  title: string
  slug: string
  status: ContentStatus
  updatedAt: string
}): ContentListItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    slug: item.slug,
    status: item.status,
    updatedAt: item.updatedAt,
  }
}

export function ContentList() {
  const { items, loading, error, setItems } = useContentList()

  const [type, setType] = useState<TypeFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')

  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((c) => {
      if (type !== 'all' && c.type !== type) return false
      if (status !== 'all' && c.status !== status) return false
      if (q && !`${c.title} ${c.slug}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, type, status, query])

  async function runAction(
    id: string,
    fn: () => Promise<{
      id: string
      type: ContentType
      title: string
      slug: string
      status: ContentStatus
      updatedAt: string
    }>,
  ) {
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await fn()
      setItems((rows) => rows.map((r) => (r.id === id ? toRow(updated) : r)))
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Something went wrong.',
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    setActionError(null)
    try {
      await deleteContent(id)
      setItems((rows) => rows.filter((r) => r.id !== id))
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Unable to delete item.',
      )
    } finally {
      setBusyId(null)
      setConfirmDeleteId(null)
    }
  }

  const isFiltering = type !== 'all' || status !== 'all' || query.trim() !== ''

  return (
    <div className="cl">
      <header className="cl-head">
        <div>
          <p className="cl-eyebrow">Content</p>
          <h1 className="cl-title">Everything you’ve made</h1>
        </div>
        <Link to="/content/new" className="btn btn--primary">
          <PlusIcon size={16} />
          New content
        </Link>
      </header>

      <div className="cl-toolbar">
        <div className="cl-search">
          <SearchIcon size={17} />
          <input
            type="search"
            placeholder="Search by title or slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search content"
          />
        </div>

        <div className="cl-selects">
          <label className="cl-select">
            <span>Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeFilter)}
            >
              <option value="all">All types</option>
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TYPE_META[t].plural}
                </option>
              ))}
            </select>
          </label>
          <label className="cl-select">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
      </div>

      <div className="cl-filterchips" role="tablist" aria-label="Filter by type">
        <button
          className={`chip${type === 'all' ? ' is-active' : ''}`}
          onClick={() => setType('all')}
        >
          All
          <em>{items.length}</em>
        </button>
        {TYPE_ORDER.map((t) => {
          const n = items.filter((c) => c.type === t).length
          return (
            <button
              key={t}
              className={`chip${type === t ? ' is-active' : ''}`}
              onClick={() => setType(t)}
            >
              {TYPE_META[t].label}
              <em>{n}</em>
            </button>
          )
        })}
      </div>

      {actionError && <div className="cl-banner">{actionError}</div>}

      {loading ? (
        <div className="cl-skeleton" aria-busy="true" aria-label="Loading content">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cl-skelrow" />
          ))}
        </div>
      ) : error ? (
        <div className="cl-empty cl-empty--error">
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="cl-empty">
          <p>No content yet.</p>
          <span className="cl-empty-sub">
            Create your first item to see it here.
          </span>
          <Link to="/content/new" className="btn btn--primary btn--sm">
            <PlusIcon size={15} />
            New content
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cl-empty">
          <p>No content matches these filters.</p>
          <button
            className="btn btn--sm"
            onClick={() => {
              setType('all')
              setStatus('all')
              setQuery('')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="cl-count">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            {isFiltering && ' · filtered'}
          </p>
          <div className="cl-table" role="table">
            <div className="cl-tr cl-tr--head" role="row">
              <span role="columnheader">Title</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Updated</span>
              <span role="columnheader" aria-label="Actions" />
            </div>
            {filtered.map((item) => {
              const Icon = TYPE_ICON[item.type]
              const busy = busyId === item.id
              const confirming = confirmDeleteId === item.id
              return (
                <div key={item.id} className="cl-tr" role="row">
                  <span className="cl-cell-title" role="cell">
                    <span className="cl-typeicon">
                      <Icon size={16} />
                    </span>
                    <span className="cl-titletext">
                      <strong>{item.title}</strong>
                      <code>/{item.slug}</code>
                    </span>
                  </span>
                  <span className="cl-cell-type" role="cell">
                    {TYPE_META[item.type].label}
                  </span>
                  <span role="cell">
                    <span className={`pill pill--${item.status}`}>
                      {item.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </span>
                  <span className="cl-cell-updated" role="cell">
                    {relativeTime(item.updatedAt)}
                  </span>
                  <span className="cl-cell-actions" role="cell">
                    {confirming ? (
                      <span className="cl-confirm">
                        <span>Delete?</span>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={busy}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn--sm cl-danger"
                          onClick={() => void handleDelete(item.id)}
                          disabled={busy}
                        >
                          {busy ? '…' : 'Delete'}
                        </button>
                      </span>
                    ) : (
                      <>
                        <Link
                          to={`/content/${item.id}/edit`}
                          className="btn btn--ghost btn--sm"
                        >
                          Edit
                        </Link>
                        {item.status === 'draft' ? (
                          <button
                            className="btn btn--sm"
                            onClick={() =>
                              void runAction(item.id, () =>
                                publishContent(item.id),
                              )
                            }
                            disabled={busy}
                            title="Publish"
                          >
                            <CheckIcon size={14} />
                            {busy ? '…' : 'Publish'}
                          </button>
                        ) : (
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() =>
                              void runAction(item.id, () =>
                                unpublishContent(item.id),
                              )
                            }
                            disabled={busy}
                            title="Move back to draft"
                          >
                            {busy ? '…' : 'Unpublish'}
                          </button>
                        )}
                        <button
                          className="cl-viewlink"
                          title="Delete"
                          aria-label="Delete item"
                          onClick={() => setConfirmDeleteId(item.id)}
                          disabled={busy}
                        >
                          <TrashGlyph />
                        </button>
                      </>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function TrashGlyph() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
    </svg>
  )
}
