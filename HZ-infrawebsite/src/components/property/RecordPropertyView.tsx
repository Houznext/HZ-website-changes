'use client';

import { useEffect } from 'react';
import { recordPreferredCity, recordTypeInterest } from '@/lib/personalization';
import { recordSeenProperty } from '@/lib/propertyListsLocal';

type Props = {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
  propertyType?: string | null;
};

export function RecordPropertyView({ slug, title, city, locality, propertyId, propertyType }: Props) {
  useEffect(() => {
    if (!slug) return;
    recordSeenProperty({ slug, title, city, locality, propertyId, propertyType });
    if (city?.trim()) recordPreferredCity(city);
    if (propertyType) recordTypeInterest(propertyType, 2);
  }, [slug, title, city, locality, propertyId, propertyType]);

  return null;
}
