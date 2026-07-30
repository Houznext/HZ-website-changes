'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/axios';
import {
  buildPersonalizationProfile,
  getTypeLimits,
  mergePropertyLists,
  sliceToLimit,
  type CuratedBuckets,
  type PersonalizationProfile,
  type PropertyTypeKey,
} from '@/lib/personalization';
import { getSavedProperties, getSeenProperties } from '@/lib/propertyListsLocal';
import type { PublicProperty } from '@/types/property.types';
import type { InfraProperty } from '@/types/infra.types';

const SECTION_LABELS: Record<PropertyTypeKey, { title: string; href: (city: string) => string; cols: 3 | 5 }> = {
  Land: { title: 'Featured Lands', href: (city) => `/buy?propertyType=Land&city=${encodeURIComponent(city)}`, cols: 5 },
  Villa: { title: 'Featured Villas', href: (city) => `/buy?propertyType=Villa&city=${encodeURIComponent(city)}`, cols: 5 },
  Apartment: { title: 'Featured Apartments', href: (city) => `/buy?propertyType=Apartment&city=${encodeURIComponent(city)}`, cols: 5 },
  Plot: { title: 'Featured Plots', href: (city) => `/buy?propertyType=Plot&city=${encodeURIComponent(city)}`, cols: 5 },
};

export type CuratedCmsRow = { type: string; title: string; cols: 3 | 5 };

export type CuratedCmsConfig = {
  defaultSubtitle?: string;
  rows?: CuratedCmsRow[];
};

async function fetchList(params: Record<string, string | number | boolean | undefined>): Promise<PublicProperty[]> {
  try {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const res = await api.get(`/properties?${qs.toString()}`);
    const body = res.data as { data?: PublicProperty[]; items?: PublicProperty[] };
    return body.data ?? body.items ?? [];
  } catch {
    return [];
  }
}

async function fetchBucket(city: string, type: PropertyTypeKey, limit: number): Promise<PublicProperty[]> {
  const inCity = await fetchList({ city, propertyType: type, limit: limit + 4, sortBy: 'newest' });
  const featuredInCity = await fetchList({
    city,
    propertyType: type,
    isFeatured: true,
    limit: limit + 2,
  });
  const featuredAny = await fetchList({ propertyType: type, isFeatured: true, limit });
  const merged = mergePropertyLists(inCity, featuredInCity, featuredAny);
  return sliceToLimit(merged, limit);
}

export type CuratedSectionData = {
  profile: PersonalizationProfile;
  buckets: CuratedBuckets;
  sections: {
    type: PropertyTypeKey;
    title: string;
    href: string;
    items: PublicProperty[];
    cols: 3 | 5;
  }[];
};

type Fallback = Partial<CuratedBuckets>;

function rowConfigForType(cms: CuratedCmsConfig | undefined, type: PropertyTypeKey) {
  const row = cms?.rows?.find((r) => r.type === type);
  const base = SECTION_LABELS[type];
  return {
    title: row?.title ?? base.title,
    cols: row?.cols ?? base.cols,
    href: base.href,
  };
}

export function usePersonalizedCurated(fallback?: Fallback, cms?: CuratedCmsConfig) {
  const { status } = useSession();
  const [data, setData] = useState<CuratedSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const cmsRef = useRef(cms);
  cmsRef.current = cms;

  const load = useCallback(async () => {
    setLoading(true);
    const seen = getSeenProperties();
    const savedLocal = getSavedProperties();
    let savedApi: InfraProperty[] = [];
    if (status === 'authenticated' && typeof window !== 'undefined' && localStorage.getItem('infra_token')) {
      try {
        const res = await api.get<InfraProperty[]>('/saved/me');
        savedApi = Array.isArray(res.data) ? res.data : [];
      } catch {
        savedApi = [];
      }
    }

    const profile = buildPersonalizationProfile({
      seen,
      savedLocal,
      savedApi: savedApi.map((p) => ({ city: p.city, propertyType: p.propertyType })),
    });

    if (cmsRef.current?.defaultSubtitle) {
      profile.subtitle = cmsRef.current.defaultSubtitle;
    }

    const limits = getTypeLimits();
    const buckets = {} as CuratedBuckets;

    await Promise.all(
      profile.typeOrder.map(async (type) => {
        const limit = limits[type];
        const personalized = await fetchBucket(profile.city, type, limit);
        const fb = fallbackRef.current?.[type];
        buckets[type] = sliceToLimit(mergePropertyLists(personalized, fb ?? []), limit);
      }),
    );

    const sections = profile.typeOrder.map((type) => {
      const cfg = rowConfigForType(cmsRef.current, type);
      return {
        type,
        title: cfg.title,
        href: cfg.href(profile.city),
        items: buckets[type],
        cols: cfg.cols,
      };
    });

    setData({ profile, buckets, sections });
    setLoading(false);
  }, [status, cms?.defaultSubtitle, cms?.rows]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, reload: load };
}
