// Client-side descriptors for the type-specific `metadata` fields (guide §4).
// The backend registry (GET /content/types) is the source of truth for *which*
// fields are required to publish; this module describes how to *render* each
// field. Keys match the backend `metadata` object exactly.

import type { ContentType } from '../api/content'

export type FieldInput = 'text' | 'url' | 'number' | 'textarea' | 'tags'

export interface FieldDef {
  /** Key inside the `metadata` object. */
  key: string
  label: string
  input: FieldInput
  placeholder?: string
  help?: string
}

export const TYPE_FIELDS: Record<ContentType, FieldDef[]> = {
  article: [],
  newsletter: [
    {
      key: 'subjectLine',
      label: 'Subject line',
      input: 'text',
      placeholder: 'What subscribers see in their inbox',
    },
    {
      key: 'previewText',
      label: 'Preview text',
      input: 'text',
      placeholder: 'The snippet shown after the subject',
    },
    {
      key: 'issueNumber',
      label: 'Issue number',
      input: 'number',
      placeholder: '14',
    },
  ],
  social_post: [
    {
      key: 'platform',
      label: 'Platform',
      input: 'text',
      placeholder: 'X, LinkedIn, Instagram…',
    },
    {
      key: 'link',
      label: 'Link',
      input: 'url',
      placeholder: 'https://…',
    },
    {
      key: 'hashtags',
      label: 'Hashtags',
      input: 'tags',
      help: 'Press Enter to add. The # is optional.',
    },
  ],
  video: [
    {
      key: 'videoUrl',
      label: 'Video URL',
      input: 'url',
      placeholder: 'https://cdn.example.com/v/123.mp4',
    },
    {
      key: 'duration',
      label: 'Duration',
      input: 'text',
      placeholder: 'PT8M30S or 8:30',
    },
    {
      key: 'thumbnailUrl',
      label: 'Thumbnail URL',
      input: 'url',
      placeholder: 'https://…',
    },
    {
      key: 'transcript',
      label: 'Transcript',
      input: 'textarea',
      placeholder: 'Full text transcript (helps SEO & AI discovery)',
    },
  ],
  podcast: [
    {
      key: 'audioUrl',
      label: 'Audio URL',
      input: 'url',
      placeholder: 'https://cdn.example.com/a/123.mp3',
    },
    {
      key: 'episodeNumber',
      label: 'Episode number',
      input: 'number',
      placeholder: '7',
    },
    {
      key: 'duration',
      label: 'Duration',
      input: 'text',
      placeholder: 'PT42M or 42:00',
    },
    {
      key: 'showNotes',
      label: 'Show notes',
      input: 'textarea',
      placeholder: 'Episode summary, links, timestamps…',
    },
  ],
}

/** Metadata keys that hold number values (converted before submit). */
export const NUMBER_METADATA_KEYS = new Set(['issueNumber', 'episodeNumber'])

/** Mirror of the backend slug utility, for a live preview while typing. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Human label for a `requiredToPublish` dot-path (e.g. "metadata.videoUrl"). */
export function requirementLabel(path: string, type: ContentType): string {
  if (!path.startsWith('metadata.')) {
    const base: Record<string, string> = {
      title: 'Title',
      slug: 'Slug',
      body: 'Body',
      summary: 'Summary',
      author: 'Author',
    }
    return base[path] ?? path
  }
  const key = path.slice('metadata.'.length)
  const field = TYPE_FIELDS[type].find((f) => f.key === key)
  return field?.label ?? key
}
