export const BROWSE_TYPE_KEYS = ['Land', 'Villa', 'Apartment', 'Plot'] as const;
export type BrowseTypeKey = (typeof BROWSE_TYPE_KEYS)[number];

export type BrowseTypeImagesDto = Record<BrowseTypeKey, string | null>;

export const DEFAULT_BROWSE_TYPE_IMAGES: BrowseTypeImagesDto = {
  Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  Plot: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
};
