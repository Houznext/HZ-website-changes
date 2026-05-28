import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { useSearchStore, type HeroTab } from '@/store/searchStore';
import api from '@/lib/axios';
import type { PublicProperty } from '@/types/property.types';

let timer: ReturnType<typeof setTimeout> | undefined;

const placeholders: Record<HeroTab, string> = {
  Land: 'e.g. agriculture land in Vikarabad, plot, HZI-P00012…',
  Villa: 'e.g. villa in Kokapet, 4BHK, property ID…',
  Apartment: 'e.g. apartment in Madhapur, 2BHK, HZI-P00012…',
  Plot: 'e.g. plot in Shamshabad, commercial land, locality…',
};

type SearchHit = PublicProperty & { propertyCode?: string | null };

export function HeroSearch() {
  const router = useRouter();
  const { activeTab, query, setQuery } = useSearchStore();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const runSearch = useCallback(
    (q: string) => {
      clearTimeout(timer);
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      timer = setTimeout(() => {
        void (async () => {
          setLoading(true);
          try {
            const res = await api.get('/properties/search', {
              params: { q: trimmed, hintType: activeTab, limit: 8 },
            });
            const body = res.data as { data?: SearchHit[]; items?: SearchHit[] };
            const items = body.data ?? body.items ?? [];
            setResults(items);
            setOpen(items.length > 0);
          } catch {
            setResults([]);
            setOpen(false);
          } finally {
            setLoading(false);
          }
        })();
      }, 280);
    },
    [activeTab],
  );

  useEffect(() => {
    runSearch(query);
  }, [query, activeTab, runSearch]);

  const goToBuy = () => {
    const c = query.trim();
    const q: Record<string, string> = {};
    if (c) q.q = c;
    if (activeTab) q.hintType = activeTab;
    void router.push({ pathname: '/buy', query: q });
  };

  const pick = (p: SearchHit) => {
    if (p.slug) void router.push(`/property/${p.slug}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] shadow-inner backdrop-blur-md">
        <div className="flex shrink-0 items-center pl-4 text-white/55" aria-hidden>
          <Search className="h-5 w-5" strokeWidth={2} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              goToBuy();
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholders[activeTab]}
          className="min-w-0 flex-1 border-0 bg-transparent py-3.5 pr-2 pl-2 font-inter text-[15px] text-white outline-none ring-0 placeholder:text-white/45"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex shrink-0 items-center p-1.5">
          <button
            type="button"
            onClick={goToBuy}
            className="rounded-lg bg-hero-blue px-5 py-2.5 font-montserrat text-sm font-bold text-white shadow-md transition hover:bg-blue-600 active:scale-[0.98]"
          >
            Search
          </button>
        </div>
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-hzwhite p-1 shadow-xl"
          role="listbox"
        >
          {loading && (
            <p className="px-3 py-2 font-inter text-xs text-muted">Searching…</p>
          )}
          {!loading &&
            results.map((p) => (
              <button
                key={p.propertyId}
                type="button"
                role="option"
                className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left hover:bg-hz-blue-light"
                onClick={() => pick(p)}
              >
                <span className="font-montserrat text-sm font-semibold text-charcoal">{p.title}</span>
                <span className="font-inter text-xs text-muted">
                  {p.propertyType}
                  {p.propertyCode ? ` · ${p.propertyCode}` : ''}
                  {p.locality || p.city ? ` · ${[p.locality, p.city].filter(Boolean).join(', ')}` : ''}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

