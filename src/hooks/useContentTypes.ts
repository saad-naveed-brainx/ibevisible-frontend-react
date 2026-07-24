import { useEffect, useState } from 'react'
import { ApiError } from '../api/auth'
import {
  getContentTypes,
  type ContentTypeDefinition,
} from '../api/content'

interface State {
  types: ContentTypeDefinition[]
  loading: boolean
  error: string | null
}

// Fetches the config-driven type registry (GET /content/types) once. Drives the
// editor's publish requirements and Schema.org labels per type (NFR-5).
export function useContentTypes(): State {
  const [types, setTypes] = useState<ContentTypeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getContentTypes()
      .then((defs) => {
        if (!cancelled) setTypes(defs)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load content types.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { types, loading, error }
}
