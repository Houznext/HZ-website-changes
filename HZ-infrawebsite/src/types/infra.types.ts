export type PropertyType =
  | 'Land'
  | 'Villa'
  | 'Apartment'
  | 'Plot'
  | 'Commercial'
  | 'Row House'
  | 'Studio'
  | 'Farmhouse';

export type ListingFor = 'Buy' | 'Rent';

export type ConstructionStatus = 'Ready to Move' | 'Under Construction' | 'New Launch';

export interface InfraProperty {
  propertyId: string;
  propertyCode?: string | null;
  title: string;
  slug: string | null;
  propertyType: PropertyType;
  listingFor: ListingFor;
  constructionStatus: ConstructionStatus;
  bhkType?: string | null;
  carpetArea?: string | null;
  areaUnit?: string | null;
  basePrice?: string | null;
  pricePerUnit?: string | null;
  city?: string | null;
  locality?: string | null;
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  description?: string | null;
  amenities?: string[] | null;
  highlights?: string[] | null;
  isApproved: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  photoUrls?: string[] | null;
  coverImageUrl?: string | null;
  floorPlanUrl?: string | null;
  media?: { mediaId: string; url: string; kind: string; sortOrder: number }[];
}

export interface InfraProject {
  projectId: string;
  name: string;
  slug: string | null;
  city?: string | null;
  locality?: string | null;
  status: ConstructionStatus;
  minPrice?: string | null;
  maxPrice?: string | null;
  heroImageUrl?: string | null;
  description?: string | null;
  milestones?: InfraProjectMilestone[];
}

export interface InfraProjectMilestone {
  milestoneId: string;
  label: string;
  date?: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  description?: string | null;
  sortOrder: number;
}

export interface InfraNewsArticle {
  articleId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  published: boolean;
  createdAt: string;
}
