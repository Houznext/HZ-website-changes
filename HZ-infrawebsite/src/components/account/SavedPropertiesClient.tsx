'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSavedProperties, type StoredPropertyRef } from '@/lib/propertyListsLocal';

export function SavedPropertiesClient() {
  const [items, setItems] = useState<StoredPropertyRef[]>([]);

  useEffect(() => {
    setItems(getSavedProperties());
  }, []);

  return (
    <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">Saved properties</h1>
      <p className="mt-2 max-w-xl font-inter text-sm text-muted">
        Tap Save on a property page to add it here. This list is stored on this device.
      </p>
      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-white p-8 text-center font-inter text-sm text-muted">
          Nothing saved yet. Open a property and use the Save button to keep it on your list.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/property/${encodeURIComponent(p.slug)}`}
                className="block rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-hz-accent/30 hover:shadow-md"
              >
                <p className="font-montserrat text-base font-bold text-charcoal">{p.title}</p>
                <p className="mt-1 font-inter text-xs text-muted">
                  {[p.locality, p.city].filter(Boolean).join(' · ') || 'Property'}
                </p>
                {p.savedAt && (
                  <p className="mt-2 font-inter text-[11px] text-muted/80">
                    Saved {new Date(p.savedAt).toLocaleString()}
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
