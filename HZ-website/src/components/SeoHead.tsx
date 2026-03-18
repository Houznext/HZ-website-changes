import Head from 'next/head'

interface SeoHeadProps {
  title: string
  description: string
  canonical: string
  schema?: object | object[]
  ogImage?: string
  noIndex?: boolean
  ogType?: 'website' | 'article'
  articleMeta?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
  }
}

export default function SeoHead({
  title,
  description,
  canonical,
  schema,
  ogImage,
  noIndex = false,
  ogType = 'website',
  articleMeta,
}: SeoHeadProps) {
  const siteName = 'Houznext'
  const fullTitle = title.includes('Houznext') ? title : `${title} | ${siteName}`
  const image = ogImage ?? 'https://houznext.com/og-default.jpg'
  const url = `https://houznext.com${canonical}`

  return (
    <Head>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Open Graph — controls WhatsApp, LinkedIn, Facebook previews */}
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:url"          content={url} />
      <meta property="og:image"        content={image} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"    content={`${siteName} — ${title}`} />
      <meta property="og:type"         content={ogType} />
      <meta property="og:locale"       content="en_IN" />
      <meta property="og:site_name"    content={siteName} />

      {/* Article-specific (blog posts) */}
      {ogType === 'article' && articleMeta?.publishedTime && (
        <meta property="article:published_time" content={articleMeta.publishedTime} />
      )}
      {ogType === 'article' && articleMeta?.modifiedTime && (
        <meta property="article:modified_time" content={articleMeta.modifiedTime} />
      )}
      {ogType === 'article' && articleMeta?.author && (
        <meta property="article:author" content={articleMeta.author} />
      )}

      {/* Twitter / X card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@houznext" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* JSON-LD structured data */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}
