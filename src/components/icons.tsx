// Minimal stroke icon set. Icons inherit `currentColor` and a 1.6px stroke so
// they sit quietly in the monochrome UI. Size defaults to 18px.

import type { SVGProps } from 'react'
import type { ContentType } from '../api/content'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Base>
)

export const LayersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Base>
)

export const SparkleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M5 12H1M23 12h-4" opacity="0" />
    <path d="M12 2.5 13.8 9 20 10.8 13.8 12.6 12 19l-1.8-6.4L4 10.8 10.2 9 12 2.5Z" />
  </Base>
)

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </Base>
)

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Base>
)

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const LogoutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Base>
)

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
)

export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Base>
)

// Per-type glyphs
export const ArticleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 3h11l3 3v15H5z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </Base>
)
export const NewsletterIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Base>
)
export const SocialIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.9A8.4 8.4 0 1 1 21 11.5Z" />
  </Base>
)
export const VideoIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="14" height="14" rx="2" />
    <path d="m21 8-4 3 4 3z" />
  </Base>
)
export const PodcastIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
  </Base>
)

export const TYPE_ICON: Record<ContentType, (p: IconProps) => React.ReactElement> = {
  article: ArticleIcon,
  newsletter: NewsletterIcon,
  social_post: SocialIcon,
  video: VideoIcon,
  podcast: PodcastIcon,
}
