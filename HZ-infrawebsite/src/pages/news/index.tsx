import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/axios';
import type { InfraNewsArticle } from '@/types/infra.types';

export default function NewsIndexPage() {
  const [items, setItems] = useState<InfraNewsArticle[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get('/news');
        setItems(res.data ?? []);
      } catch {
        setItems([]);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">News & guides</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <Link key={a.articleId} href={`/news/${a.slug}`} className="rounded-2xl border border-border bg-hzwhite p-5 transition hover:border-hz-blue/40 hover:shadow-md">
              <div className="font-montserrat text-lg font-bold text-charcoal">{a.title}</div>
              {a.excerpt && <p className="mt-2 font-inter text-sm text-muted line-clamp-3">{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
