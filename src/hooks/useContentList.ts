import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/auth'
import { listContent, type ContentListItem } from '../api/content'

interface ContentListState {
  items: ContentListItem[]
  loading: boolean
  error: string | null
  /** Re-fetch from the server. */
  reload: () => void
  /** Optimistically replace the local rows (after a mutation). */
  setItems: React.Dispatch<React.SetStateAction<ContentListItem[]>>
}

// Fetches the full (unfiltered) content list once. Filtering/search happen
// client-side so the list stays instant and the dashboard can derive counts
// from the same data.
export function useContentList(): ContentListState {
  const [items, setItems] = useState<ContentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    listContent()
      .then((rows) => {
        if (cancelled) return
        setItems(rows)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load content. Try again.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [nonce])

  return { items, loading, error, reload, setItems }
}
