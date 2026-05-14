'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSeenProperties, type StoredPropertyRef } from '@/lib/propertyListsLocal';

export function SeenPropertiesClient() {
  const [items, setItems] = useState<StoredPropertyRef[]>([]);

  useEffect(() => {
    setItems(getSeenProperties());
  }, []);

  return (
    <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">Seen properties</h1>
      <p className="mt-2 max-w-xl font-inter text-sm text-muted">
        Properties you opened on this device appear here. Sign in on the same browser to keep this list while you browse.
      </p>
      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-white p-8 text-center font-inter text-sm text-muted">
          No properties yet. Open a listing from Buy or search to build your history.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/property/${encodeURIComponent(p.slug)}`}
                className="block rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-hz-blue/25 hover:shadow-md"
              >
                <p className="font-montserrat text-base font-bold text-charcoal">{p.title}</p>
                <p className="mt-1 font-inter text-xs text-muted">
                  {[p.locality, p.city].filter(Boolean).join(' · ') || 'Property'}
                </p>
                {p.viewedAt && (
                  <p className="mt-2 font-inter text-[11px] text-muted/80">
                    Viewed {new Date(p.viewedAt).toLocaleString()}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
