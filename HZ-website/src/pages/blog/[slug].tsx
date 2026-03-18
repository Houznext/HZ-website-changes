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
              href="https://wa.me/918498823043?text=Hi%20Houznext%2C%20I%20read%20your%20blog%20and%20want%20a%20free%20estimate"
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

  try {
    // Fetch from backend API with ISR
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`)
    if (res.ok) {
      const post = await res.json()
      return { props: { post }, revalidate: 3600 }
    }
  } catch {
    // fallthrough to static fallback
  }

  // Static fallback while backend isn't ready
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
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog?limit=50`)
    if (res.ok) {
      const posts = await res.json() as Array<{ slug: string }>
      return {
        paths: posts.map((p) => ({ params: { slug: p.slug } })),
        fallback: 'blocking',
      }
    }
  } catch {
    // fallthrough to empty paths
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
