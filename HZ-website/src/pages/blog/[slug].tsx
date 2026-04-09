import { GetStaticPaths, GetStaticProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { articleSchema } from '@/lib/schemas'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  datePublished: string
  dateModified: string
  readTime: string
}

interface Props {
  post: BlogPost
}

function formatBlogDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function estimateReadMin(content: string, preview: string): string {
  const len = (content?.length || 0) + (preview?.length || 0)
  const mins = Math.max(3, Math.min(25, Math.ceil(len / 1200)))
  return `${mins} min`
}

/** Map Nest `Blog` JSON to page props */
function mapApiBlogToPost(raw: Record<string, unknown>, fallbackSlug: string): BlogPost {
  const slug =
    (typeof raw.slug === 'string' && raw.slug) ? raw.slug : fallbackSlug
  const title = typeof raw.title === 'string' ? raw.title : 'Blog'
  const preview =
    typeof raw.previewDescription === 'string' ? raw.previewDescription : ''
  const content = typeof raw.content === 'string' ? raw.content : ''
  const category =
    typeof raw.blogType === 'string' ? raw.blogType : 'General'
  const createdAt =
    typeof raw.createdAt === 'string' ? raw.createdAt : undefined
  const updatedAt =
    typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined

  return {
    slug,
    title,
    excerpt: preview,
    content,
    category,
    datePublished: formatBlogDate(createdAt) || formatBlogDate(updatedAt),
    dateModified: formatBlogDate(updatedAt) || formatBlogDate(createdAt),
    readTime: estimateReadMin(content, preview),
  }
}

export default function BlogPost({ post }: Props) {
  if (!post) return null

  return (
    <>
      <SeoHead
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        articleMeta={{
          publishedTime: post.datePublished,
          modifiedTime: post.dateModified,
          author: 'Houznext',
        }}
        schema={articleSchema({
          title: post.title,
          description: post.excerpt,
          slug: post.slug,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
        })}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        {/* Hero */}
        <div className="py-14 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-3xl mx-auto">
            <span className="text-[11px] font-head font-bold px-3 py-1 rounded-full mb-4 inline-block" style={{ background: 'rgba(47,128,237,0.2)', color: '#2f80ed' }}>
              {post.category}
            </span>
            <h1 className="font-head font-black text-[30px] md:text-[40px] leading-[1.2] text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span>{post.datePublished}</span>
              <span>·</span>
              <span>{post.readTime} read</span>
              <span>·</span>
              <span>By Houznext</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <article
            className="bg-white rounded-2xl border p-8 prose prose-sm max-w-none"
            style={{ borderColor: '#dde8f5' }}
          >
            <p className="text-[15px] leading-relaxed font-[500] text-charcoal mb-6">{post.excerpt}</p>
            <div
              className="text-[14px] leading-relaxed"
              style={{ color: '#1f2933' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* CTA */}
          <div className="mt-8 p-6 rounded-2xl text-center" style={{ background: '#0f2a44' }}>
            <h3 className="font-head font-bold text-white text-[18px] mb-2">Ready to start your project?</h3>
            <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Get a free personalised estimate from our design team
            </p>
            <a
              href="https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20read%20your%20blog%20and%20want%20a%20free%20estimate"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-head font-bold text-white text-[13px]"
              style={{ background: '#2f80ed' }}
            >
              Get free estimate →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT

  if (apiBase) {
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/blog/${encodeURIComponent(slug)}`)
      if (res.ok) {
        const raw = (await res.json()) as Record<string, unknown>
        return {
          props: { post: mapApiBlogToPost(raw, slug) },
          revalidate: 3600,
        }
      }
    } catch {
      // fallthrough to static fallback
    }
  }

  const fallbackPost: BlogPost = {
    slug,
    title: `Article: ${slug.replace(/-/g, ' ')}`,
    excerpt: 'This article covers everything you need to know about home interiors and construction in Telangana.',
    content: '<p>Full article content will be available here once the backend API is connected.</p>',
    category: 'Interiors',
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    readTime: '5 min',
  }

  return { props: { post: fallbackPost }, revalidate: 3600 }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT

  if (apiBase) {
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/blog?take=100`)
      if (res.ok) {
        const data = (await res.json()) as { blogs?: Array<{ slug?: string | null }> }
        const blogs = Array.isArray(data?.blogs) ? data.blogs : []
        const paths = blogs
          .filter((p) => typeof p.slug === 'string' && p.slug.length > 0)
          .map((p) => ({ params: { slug: p.slug as string } }))
        return {
          paths,
          fallback: 'blocking',
        }
      }
    } catch {
      // fallthrough
    }
  }

  return {
    paths: [
      { params: { slug: 'modular-kitchen-cost-hyderabad' } },
      { params: { slug: 'false-ceiling-cost-guide' } },
      { params: { slug: 'rera-compliance-telangana' } },
    ],
    fallback: 'blocking',
  }
}
