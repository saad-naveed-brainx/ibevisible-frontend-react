import { request } from './auth'

// Mirrors backend/docs/frontend-api-integration.md §5. `social_post` is the
// backend's key for social posts (the UI labels it "Social Post").

export type ContentType =
  | 'article'
  | 'newsletter'
  | 'social_post'
  | 'video'
  | 'podcast'

export type ContentStatus = 'draft' | 'published'

export interface ContentTypeDefinition {
  type: ContentType
  label: string
  schemaType: string
  requiredToPublish: string[] // dot-paths, e.g. "metadata.videoUrl"
}

export interface ContentItemResponse {
  id: string
  organizationId: string
  type: ContentType
  title: string
  slug: string
  summary: string | null
  body: string | null
  status: ContentStatus
  author: string | null
  tags: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface ContentListItem {
  id: string
  type: ContentType
  title: string
  slug: string
  status: ContentStatus
  updatedAt: string
}

export interface CreateContentInput {
  type: ContentType
  title: string
  slug?: string
  summary?: string
  body?: string
  author?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

export type UpdateContentInput = Partial<Omit<CreateContentInput, 'type'>>

export interface ListContentQuery {
  type?: ContentType
  status?: ContentStatus
}

export function getContentTypes(): Promise<ContentTypeDefinition[]> {
  return request<ContentTypeDefinition[]>('/content/types')
}

export function listContent(
  query: ListContentQuery = {},
): Promise<ContentListItem[]> {
  const params = new URLSearchParams()
  if (query.type) params.set('type', query.type)
  if (query.status) params.set('status', query.status)
  const qs = params.toString()
  return request<ContentListItem[]>(`/content${qs ? `?${qs}` : ''}`)
}

export function getContent(id: string): Promise<ContentItemResponse> {
  return request<ContentItemResponse>(`/content/${id}`)
}

export function createContent(
  body: CreateContentInput,
): Promise<ContentItemResponse> {
  return request<ContentItemResponse>('/content', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateContent(
  id: string,
  body: UpdateContentInput,
): Promise<ContentItemResponse> {
  return request<ContentItemResponse>(`/content/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteContent(id: string): Promise<void> {
  return request<void>(`/content/${id}`, { method: 'DELETE' })
}

export function publishContent(id: string): Promise<ContentItemResponse> {
  return request<ContentItemResponse>(`/content/${id}/publish`, {
    method: 'POST',
  })
}

export function unpublishContent(id: string): Promise<ContentItemResponse> {
  return request<ContentItemResponse>(`/content/${id}/unpublish`, {
    method: 'POST',
  })
}
