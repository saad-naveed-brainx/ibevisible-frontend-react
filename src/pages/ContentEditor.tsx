import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ApiError } from '../api/auth'
import {
  createContent,
  deleteContent,
  getContent,
  publishContent,
  unpublishContent,
  updateContent,
  type ContentItemResponse,
  type ContentStatus,
  type ContentType,
} from '../api/content'
import { useContentTypes } from '../hooks/useContentTypes'
import { TYPE_META, TYPE_ORDER, relativeTime } from '../data/content'
import {
  NUMBER_METADATA_KEYS,
  TYPE_FIELDS,
  requirementLabel,
  slugify,
} from '../data/typeFields'
import { TagInput } from '../components/TagInput'
import { TYPE_ICON, ArrowUpRight, CheckIcon } from '../components/icons'
import './content-editor.css'

const ORG_DOMAIN = 'northlight.studio'

const CONTENT_TYPES = new Set<ContentType>(TYPE_ORDER)
function isContentType(v: string | null): v is ContentType {
  return v !== null && CONTENT_TYPES.has(v as ContentType)
}

/* ========================================================================
   Route entry — decides between the type picker and the editor form.
   ======================================================================== */
export function ContentEditor() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const typeParam = params.get('type')

  if (id) return <EditorForm key={id} mode="edit" id={id} />
  if (isContentType(typeParam))
    return <EditorForm key={typeParam} mode="create" type={typeParam} />
  return <TypePicker />
}

/* ========================================================================
   Type picker (create, no type chosen yet)
   ======================================================================== */
function TypePicker() {
  const { types } = useContentTypes()
  const schemaFor = (t: ContentType) =>
    types.find((d) => d.type === t)?.schemaType ?? TYPE_META[t].schema

  return (
    <div className="ed">
      <header className="ed-picker-head">
        <Link to="/content" className="ed-back">
          ← Content
        </Link>
        <h1 className="ed-picker-title">What are you creating?</h1>
        <p className="ed-picker-sub">
          Pick a type. Each one shows only the fields it needs and emits the
          right Schema.org structured data.
        </p>
      </header>

      <div className="ed-picker-grid">
        {TYPE_ORDER.map((t) => {
          const meta = TYPE_META[t]
          const Icon = TYPE_ICON[t]
          return (
            <Link
              key={t}
              to={`/content/new?type=${t}`}
              className="ed-picker-card"
            >
              <span className="ed-picker-icon">
                <Icon size={20} />
              </span>
              <span className="ed-picker-name">{meta.label}</span>
              <span className="ed-picker-blurb">{meta.blurb}</span>
              <code className="ed-picker-schema">{schemaFor(t)}</code>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ========================================================================
   Editor form (shared by create + edit)
   ======================================================================== */
type MetaValue = string | string[]

interface FormState {
  title: string
  slug: string
  slugTouched: boolean
  summary: string
  body: string
  author: string
  tags: string[]
  metadata: Record<string, MetaValue>
}

function emptyForm(type: ContentType): FormState {
  const metadata: Record<string, MetaValue> = {}
  for (const f of TYPE_FIELDS[type]) metadata[f.key] = f.input === 'tags' ? [] : ''
  return {
    title: '',
    slug: '',
    slugTouched: false,
    summary: '',
    body: '',
    author: '',
    tags: [],
    metadata,
  }
}

function formFromItem(item: ContentItemResponse): FormState {
  const metadata: Record<string, MetaValue> = {}
  for (const f of TYPE_FIELDS[item.type]) {
    const raw = (item.metadata as Record<string, unknown>)[f.key]
    if (f.input === 'tags') {
      metadata[f.key] = Array.isArray(raw) ? (raw as string[]) : []
    } else if (raw === null || raw === undefined) {
      metadata[f.key] = ''
    } else {
      metadata[f.key] = String(raw)
    }
  }
  return {
    title: item.title,
    slug: item.slug,
    slugTouched: true,
    summary: item.summary ?? '',
    body: item.body ?? '',
    author: item.author ?? '',
    tags: item.tags ?? [],
    metadata,
  }
}

type EditorFormProps =
  | { mode: 'create'; type: ContentType; id?: undefined }
  | { mode: 'edit'; id: string; type?: undefined }

function EditorForm(props: EditorFormProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { types } = useContentTypes()

  const [type, setType] = useState<ContentType>(
    props.mode === 'create' ? props.type : 'article',
  )
  const [form, setForm] = useState<FormState>(() =>
    props.mode === 'create' ? emptyForm(props.type) : emptyForm('article'),
  )
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(
    props.mode === 'edit' ? props.id : null,
  )

  const [loading, setLoading] = useState(props.mode === 'edit')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'unpublish' | 'delete'>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Load the item in edit mode.
  useEffect(() => {
    if (props.mode !== 'edit') return
    let cancelled = false
    setLoading(true)
    getContent(props.id)
      .then((item) => {
        if (cancelled) return
        setType(item.type)
        setForm(formFromItem(item))
        setStatus(item.status)
        setPublishedAt(item.publishedAt)
        setUpdatedAt(item.updatedAt)
        setItemId(item.id)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(
          err instanceof ApiError ? err.message : 'Unable to load this item.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [props.mode, props.id])

  const definition = types.find((d) => d.type === type)
  const schemaType = definition?.schemaType ?? TYPE_META[type].schema
  const requiredToPublish = definition?.requiredToPublish ?? []

  const effectiveSlug = form.slugTouched ? form.slug : slugify(form.title)

  function patch(next: Partial<FormState>) {
    setForm((f) => ({ ...f, ...next }))
    setDirty(true)
    setNotice(null)
  }
  function setMeta(key: string, value: MetaValue) {
    setForm((f) => ({ ...f, metadata: { ...f.metadata, [key]: value } }))
    setDirty(true)
    setNotice(null)
  }

  // Publish-requirement satisfaction against current form values (FR-2.6).
  function satisfied(path: string): boolean {
    if (path === 'title') return form.title.trim() !== ''
    if (path === 'slug') return effectiveSlug !== ''
    if (path === 'body') return form.body.trim() !== ''
    if (path === 'summary') return form.summary.trim() !== ''
    if (path === 'author') return form.author.trim() !== ''
    if (path.startsWith('metadata.')) {
      const v = form.metadata[path.slice('metadata.'.length)]
      return Array.isArray(v) ? v.length > 0 : (v ?? '').toString().trim() !== ''
    }
    return true
  }
  const allRequirementsMet = requiredToPublish.every(satisfied)

  function buildMetadata(): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const f of TYPE_FIELDS[type]) {
      const v = form.metadata[f.key]
      if (f.input === 'tags') {
        if (Array.isArray(v) && v.length) out[f.key] = v
      } else if (typeof v === 'string' && v.trim() !== '') {
        out[f.key] = NUMBER_METADATA_KEYS.has(f.key) ? Number(v) : v.trim()
      }
    }
    return out
  }

  function basePayload() {
    const metadata = buildMetadata()
    return {
      title: form.title.trim(),
      slug: effectiveSlug || undefined,
      summary: form.summary.trim() || undefined,
      body: form.body.trim() || undefined,
      author: form.author.trim() || undefined,
      tags: form.tags,
      ...(Object.keys(metadata).length ? { metadata } : {}),
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('A title is required.')
      return
    }
    setBusy('save')
    setError(null)
    try {
      if (itemId) {
        const updated = await updateContent(itemId, basePayload())
        applyItem(updated)
        setDirty(false)
        setNotice('Changes saved.')
      } else {
        const created = await createContent({ type, ...basePayload() })
        setDirty(false)
        navigate(`/content/${created.id}/edit`, {
          replace: true,
          state: { justCreated: true },
        })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save.')
    } finally {
      setBusy(null)
    }
  }

  function applyItem(item: ContentItemResponse) {
    setStatus(item.status)
    setPublishedAt(item.publishedAt)
    setUpdatedAt(item.updatedAt)
    setForm(formFromItem(item))
    setType(item.type)
  }

  async function handlePublish() {
    if (!itemId) return
    setBusy('publish')
    setError(null)
    try {
      if (dirty) await updateContent(itemId, basePayload())
      const published = await publishContent(itemId)
      applyItem(published)
      setDirty(false)
      setNotice('Published — it’s now live and in your sitemap.')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Unable to publish this item.',
      )
    } finally {
      setBusy(null)
    }
  }

  async function handleUnpublish() {
    if (!itemId) return
    setBusy('unpublish')
    setError(null)
    try {
      const item = await unpublishContent(itemId)
      applyItem(item)
      setNotice('Moved back to draft.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to unpublish.')
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete() {
    if (!itemId) return
    setBusy('delete')
    setError(null)
    try {
      await deleteContent(itemId)
      navigate('/content', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete.')
      setBusy(null)
      setConfirmDelete(false)
    }
  }

  // Surface the "just created" hint arriving from create → edit redirect.
  useEffect(() => {
    if ((location.state as { justCreated?: boolean } | null)?.justCreated) {
      setNotice('Draft created. Add the finishing touches, then publish.')
    }
  }, [location.state])

  if (loading) {
    return (
      <div className="ed">
        <div className="ed-loading">Loading…</div>
      </div>
    )
  }
  if (loadError) {
    return (
      <div className="ed">
        <Link to="/content" className="ed-back">
          ← Content
        </Link>
        <div className="ed-banner ed-banner--error">{loadError}</div>
      </div>
    )
  }

  const Icon = TYPE_ICON[type]
  const isPublished = status === 'published'
  const anyBusy = busy !== null

  return (
    <div className="ed">
      <div className="ed-topbar">
        <Link to="/content" className="ed-back">
          ← Content
        </Link>
        <div className="ed-topbar-actions">
          <span className={`pill pill--${status}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
          {itemId && isPublished && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => void handleUnpublish()}
              disabled={anyBusy}
            >
              {busy === 'unpublish' ? '…' : 'Unpublish'}
            </button>
          )}
          <button
            className="btn btn--sm"
            onClick={() => void handleSave()}
            disabled={anyBusy || (!!itemId && !dirty)}
          >
            {busy === 'save'
              ? 'Saving…'
              : itemId
                ? dirty
                  ? 'Save changes'
                  : 'Saved'
                : 'Save draft'}
          </button>
          {itemId && !isPublished && (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => void handlePublish()}
              disabled={anyBusy || !allRequirementsMet}
              title={
                allRequirementsMet
                  ? 'Publish'
                  : 'Complete the required fields to publish'
              }
            >
              {busy === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {notice && <div className="ed-banner ed-banner--ok">{notice}</div>}
      {error && <div className="ed-banner ed-banner--error">{error}</div>}

      <div className="ed-grid">
        {/* Main column */}
        <div className="ed-main">
          <input
            className="ed-titlefield"
            placeholder="Untitled"
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            aria-label="Title"
          />

          <div className="ed-slug">
            <span className="ed-slug-domain">{ORG_DOMAIN}/</span>
            <input
              className="ed-slug-input"
              value={effectiveSlug}
              placeholder="slug"
              onChange={(e) =>
                patch({ slug: slugify(e.target.value), slugTouched: true })
              }
              aria-label="Slug"
            />
            {form.slugTouched && (
              <button
                type="button"
                className="ed-slug-reset"
                onClick={() => patch({ slug: '', slugTouched: false })}
                title="Regenerate from title"
              >
                Reset
              </button>
            )}
          </div>

          <Field label="Summary" hint="Used for meta description & previews">
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => patch({ summary: e.target.value })}
              placeholder="A short description of this content…"
            />
          </Field>

          <Field
            label={type === 'social_post' ? 'Post text' : 'Body'}
            hint={type === 'video' || type === 'podcast' ? 'Optional' : undefined}
          >
            <textarea
              className="ed-body"
              rows={type === 'social_post' ? 5 : 12}
              value={form.body}
              onChange={(e) => patch({ body: e.target.value })}
              placeholder={
                type === 'social_post'
                  ? 'What do you want to say?'
                  : 'Write your content…'
              }
            />
          </Field>

          {TYPE_FIELDS[type].length > 0 && (
            <div className="ed-section">
              <h3 className="ed-section-title">
                <Icon size={16} />
                {TYPE_META[type].label} details
              </h3>
              <div className="ed-metagrid">
                {TYPE_FIELDS[type].map((f) => (
                  <Field
                    key={f.key}
                    label={f.label}
                    hint={f.help}
                    wide={f.input === 'textarea' || f.input === 'tags'}
                    required={requiredToPublish.includes(`metadata.${f.key}`)}
                  >
                    {f.input === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={(form.metadata[f.key] as string) ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => setMeta(f.key, e.target.value)}
                      />
                    ) : f.input === 'tags' ? (
                      <TagInput
                        value={(form.metadata[f.key] as string[]) ?? []}
                        onChange={(next) => setMeta(f.key, next)}
                        placeholder="Add and press Enter"
                      />
                    ) : (
                      <input
                        type={f.input === 'number' ? 'number' : 'text'}
                        inputMode={f.input === 'number' ? 'numeric' : undefined}
                        value={(form.metadata[f.key] as string) ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => setMeta(f.key, e.target.value)}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side column */}
        <aside className="ed-aside">
          <div className="ed-card">
            <div className="ed-type">
              <span className="ed-type-icon">
                <Icon size={18} />
              </span>
              <span className="ed-type-meta">
                <strong>{TYPE_META[type].label}</strong>
                <code>{schemaType}</code>
              </span>
            </div>
            {updatedAt && (
              <p className="ed-updated">Updated {relativeTime(updatedAt)}</p>
            )}
            {isPublished && publishedAt && (
              <p className="ed-updated">
                Published {relativeTime(publishedAt)}
              </p>
            )}
          </div>

          <div className="ed-card">
            <Field label="Author">
              <input
                value={form.author}
                onChange={(e) => patch({ author: e.target.value })}
                placeholder="Who wrote this?"
              />
            </Field>
            <Field label="Tags" hint="Press Enter to add">
              <TagInput
                value={form.tags}
                onChange={(next) => patch({ tags: next })}
                placeholder="Add a tag"
              />
            </Field>
          </div>

          <div className="ed-card">
            <h3 className="ed-card-title">Publish checklist</h3>
            {requiredToPublish.length === 0 ? (
              <p className="ed-check-note">No required fields for this type.</p>
            ) : (
              <ul className="ed-checklist">
                {requiredToPublish.map((path) => {
                  const ok = satisfied(path)
                  return (
                    <li key={path} className={ok ? 'is-ok' : ''}>
                      <span className="ed-check-mark">
                        {ok ? <CheckIcon size={13} /> : null}
                      </span>
                      {requirementLabel(path, type)}
                    </li>
                  )
                })}
              </ul>
            )}
            {!itemId && (
              <p className="ed-check-note">
                Save this draft to enable publishing.
              </p>
            )}
          </div>

          <a
            className="ed-preview-link"
            href={isPublished ? `https://${ORG_DOMAIN}/${effectiveSlug}` : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!isPublished}
            onClick={(e) => {
              if (!isPublished) e.preventDefault()
            }}
          >
            View public page <ArrowUpRight size={14} />
          </a>

          {itemId && (
            <div className="ed-danger">
              {confirmDelete ? (
                <div className="ed-danger-confirm">
                  <span>Delete this item permanently?</span>
                  <div>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={anyBusy}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => void handleDelete()}
                      disabled={anyBusy}
                    >
                      {busy === 'delete' ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="ed-danger-trigger"
                  onClick={() => setConfirmDelete(true)}
                  disabled={anyBusy}
                >
                  Delete this item
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ---- Small field wrapper ---------------------------------------------- */
function Field({
  label,
  hint,
  required,
  wide,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <label className={`ed-field${wide ? ' ed-field--wide' : ''}`}>
      <span className="ed-field-label">
        {label}
        {required && <em className="ed-req" title="Required to publish" />}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  )
}
