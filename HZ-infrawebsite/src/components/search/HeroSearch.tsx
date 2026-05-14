import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { useSearchStore, type HeroTab } from '@/store/searchStore';
import api from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';

let timer: ReturnType<typeof setTimeout> | undefined;

const placeholders: Record<HeroTab, string> = {
  Land: 'Search land by city, locality or project…',
  Villa: 'Search villas by city, locality or project…',
  Apartment: 'Search apartments by city, locality or project…',
  Plot: 'Search plots by city, locality or project…',
};

export function HeroSearch() {
  const router = useRouter();
  const { activeTab, query, setQuery } = useSearchStore();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const renderResults = useCallback(
    (items: InfraProperty[]) => {
      const host = dropRef.current;
      if (!host) return;
      while (host.firstChild) host.removeChild(host.firstChild);
      if (!items.length) {
        host.classList.add('hidden');
        return;
      }
      host.classList.remove('hidden');
      items.forEach((p) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className =
          'flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm text-charcoal hover:bg-hz-blue-light';
        const t = document.createElement('div');
        t.className = 'font-montserrat font-semibold';
        t.textContent = p.title;
        const s = document.createElement('div');
        s.className = 'font-inter text-xs text-muted';
        s.textContent = `${p.propertyType} · ${p.locality || p.city || ''}`;
        row.appendChild(t);
        row.appendChild(s);
        row.addEventListener('click', () => {
          if (p.slug) void router.push(`/property/${p.slug}`);
          host.classList.add('hidden');
        });
        host.appendChild(row);
      });
    },
    [router],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) dropRef.current?.classList.add('hidden');
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const runSearch = (q: string) => {
    clearTimeout(timer);
    if (q.trim().length < 2) {
      dropRef.current?.classList.add('hidden');
      return;
    }
    timer = setTimeout(() => {
      void (async () => {
        try {
          const res = await api.get('/properties', {
            params: { type: activeTab, limit: 6, city: undefined },
          });
          const items: InfraProperty[] = (res.data?.data ?? res.data?.items ?? []).filter((p: InfraProperty) =>
            p.title.toLowerCase().includes(q.toLowerCase()),
          );
          renderResults(items.slice(0, 6));
        } catch {
          renderResults([]);
        }
      })();
    }, 280);
  };

  const goToBuy = () => {
    const q: Record<string, string> = { propertyType: activeTab };
    const c = query.trim();
    if (c) q.city = c;
    void router.push({ pathname: '/buy', query: q });
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] shadow-inner backdrop-blur-md">
        <div className="flex shrink-0 items-center pl-4 text-white/55" aria-hidden>
          <Search className="h-5 w-5" strokeWidth={2} />
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            runSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              goToBuy();
            }
          }}
          placeholder={placeholders[activeTab]}
          className="min-w-0 flex-1 border-0 bg-transparent py-3.5 pr-2 pl-2 font-inter text-[15px] text-white outline-none ring-0 placeholder:text-white/45"
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
      <div
        ref={dropRef}
        className="absolute left-0 right-0 top-full z-50 mt-2 hidden max-h-72 overflow-auto rounded-xl border border-border bg-hzwhite p-1 shadow-xl"
      />
    </div>
  );
}
