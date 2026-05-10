import React from 'react'

type Props = {
  src?: string | null
  alt: string
  className?: string
  /** Passed through to `<img loading>` */
  priority?: boolean
}

/**
 * Blog thumbnails/covers come from the CMS (S3, CDNs, or any URL). Using `next/image`
 * requires every hostname in `next.config.js`, which breaks for new buckets or stray
 * test URLs. Plain `<img>` works for SSR/CSR without config churn.
 */
export default function BlogRemoteImage({ src, alt, className = '', priority = false }: Props) {
  const url = typeof src === 'string' ? src.trim() : ''
  if (!url) return null

  return (
    <img
      src={url}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`absolute inset-0 h-full w-full object-cover ${className}`.trim()}
    />
  )
}
