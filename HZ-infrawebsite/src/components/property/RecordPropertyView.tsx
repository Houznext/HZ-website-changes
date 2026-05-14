'use client';

import { useEffect } from 'react';
import { recordSeenProperty } from '@/lib/propertyListsLocal';

type Props = {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
};

export function RecordPropertyView({ slug, title, city, locality, propertyId }: Props) {
  useEffect(() => {
    if (!slug) return;
    recordSeenProperty({ slug, title, city, locality, propertyId });
  }, [slug, title, city, locality, propertyId]);

  return null;
}
