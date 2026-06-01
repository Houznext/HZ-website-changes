'use client';

import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useSaveProperty } from '@/hooks/useSaveProperty';

type Props = {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
};

export function SavePropertyButton({ slug, title, city, locality, propertyId }: Props) {
  const { saved, toggle } = useSaveProperty({ slug, propertyId });

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-inter text-sm font-semibold transition',
        saved
          ? 'border-hz-accent/40 bg-hz-accent/10 text-hz-accent'
          : 'border-border bg-white text-charcoal hover:border-hz-accent/30 hover:bg-hz-blue-light',
      )}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved properties' : 'Save property'}
    >
      <Heart className={clsx('h-4 w-4 shrink-0', saved && 'fill-current')} strokeWidth={2} aria-hidden />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
