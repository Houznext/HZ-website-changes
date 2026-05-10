import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSearchStore } from '@/store/searchStore';
import api from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';

let timer: ReturnType<typeof setTimeout> | undefined;

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
          const items: InfraProperty[] = (res.data?.items ?? []).filter((p: InfraProperty) =>
            p.title.toLowerCase().includes(q.toLowerCase()),
          );
          renderResults(items.slice(0, 6));
        } catch {
          renderResults([]);
        }
      })();
    }, 280);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          runSearch(e.target.value);
        }}
        placeholder={`Search ${activeTab.toLowerCase()} in Hyderabad, Bengaluru…`}
        className="w-full rounded-xl border border-border bg-hzwhite/95 px-4 py-3 font-inter text-sm text-charcoal shadow-lg outline-none ring-0 placeholder:text-muted focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/20"
      />
      <div
        ref={dropRef}
        className="absolute left-0 right-0 top-full z-50 mt-2 hidden max-h-72 overflow-auto rounded-xl border border-border bg-hzwhite p-1 shadow-xl"
      />
    </div>
  );
}
