// Presentation metadata for content types. The source of truth for a type's
// fields and publish requirements is the backend registry (GET /content/types);
// this module only holds display strings and helpers the UI needs.

import type { ContentType } from '../api/content'

export type { ContentType, ContentStatus } from '../api/content'

export interface TypeMeta {
  type: ContentType
  label: string
  plural: string
  /** Schema.org type emitted by the visibility layer for this content type. */
  schema: string
  /** Editorial one-liner describing the type. */
  blurb: string
}

export const TYPE_META: Record<ContentType, TypeMeta> = {
  article: {
    type: 'article',
    label: 'Article',
    plural: 'Articles',
    schema: 'Article',
    blurb: 'Long-form writing and guides.',
  },
  newsletter: {
    type: 'newsletter',
    label: 'Newsletter',
    plural: 'Newsletters',
    schema: 'Article / NewsArticle',
    blurb: 'Issues sent to your subscribers.',
  },
  social_post: {
    type: 'social_post',
    label: 'Social Post',
    plural: 'Social Posts',
    schema: 'SocialMediaPosting',
    blurb: 'Short posts for X, LinkedIn & more.',
  },
  video: {
    type: 'video',
    label: 'Video',
    plural: 'Videos',
    schema: 'VideoObject',
    blurb: 'Video content referenced by URL.',
  },
  podcast: {
    type: 'podcast',
    label: 'Podcast',
    plural: 'Podcasts',
    schema: 'PodcastEpisode',
    blurb: 'Audio episodes and show notes.',
  },
}

export const TYPE_ORDER: ContentType[] = [
  'article',
  'newsletter',
  'social_post',
  'video',
  'podcast',
]

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.round((now - then) / 1000)
  const abs = Math.abs(diff)
  const table: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (let i = 0; i < table.length; i++) {
    const [limit, unit] = table[i]
    if (abs < limit) {
      const divisor = i === 0 ? 1 : table[i - 1][0]
      return rtf.format(-Math.round(diff / divisor), unit)
    }
  }
  return rtf.format(-Math.round(diff / 31557600), 'year')
}
