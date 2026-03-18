import Head from 'next/head'

interface SeoHeadProps {
  title: string
  description: string
  canonical: string
  schema?: object | object[]
  ogImage?: string
  noIndex?: boolean
}

export default function SeoHead({
  title,
  description,
  canonical,
  schema,
  ogImage,
  noIndex = false,
}: SeoHeadProps) {
  const fullTitle = `${title} | Houznext`
  const image = ogImage ?? 'https://houznext.com/og-default.jpg'
  const url = `https://houznext.com${canonical}`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:url"          content={url} />
      <meta property="og:image"        content={image} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type"         content="website" />
      <meta property="og:locale"       content="en_IN" />
      <meta property="og:site_name"    content="Houznext" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}
