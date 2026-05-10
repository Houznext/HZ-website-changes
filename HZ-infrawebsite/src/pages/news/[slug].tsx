import { GetServerSideProps } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { InfraNewsArticle } from '@/types/infra.types';

type Props = { article: InfraNewsArticle | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  try {
    const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
    const res = await fetch(`${base}/news/${encodeURIComponent(slug)}`);
    if (!res.ok) return { notFound: true };
    return { props: { article: await res.json() } };
  } catch {
    return { notFound: true };
  }
};

export default function NewsArticlePage({ article }: Props) {
  if (!article) return null;
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">{article.title}</h1>
        <div className="prose prose-sm mt-6 max-w-none font-inter text-charcoal">
          {(article.body || article.excerpt || '').split('\n').map((p, i) => (
            <p key={i} className="mb-4">
              {p}
            </p>
          ))}
        </div>
      </article>
      <Footer />
    </div>
  );
}
