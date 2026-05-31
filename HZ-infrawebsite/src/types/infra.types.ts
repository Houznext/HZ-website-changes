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

export type ConstructionStatus = 'Ready to Move' | 'Under Construction' | 'New Launch' | 'Sold Out';

export type ProjectType = 'apartment' | 'villa' | 'venture' | 'villaplot';

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

export interface InfraProjectConfiguration {
  type: string;
  area?: string;
  basePrice?: string;
  allInclusive?: string;
  availability?: string;
  plotArea?: string;
  builtUp?: string;
  floors?: string;
  price?: string;
  facing?: string;
}

export interface InfraProjectInfrastructure {
  label: string;
  status: string;
}

export interface InfraProject {
  projectId: string;
  name: string;
  slug: string | null;
  projectType?: ProjectType | null;
  developerName?: string | null;
  refCode?: string | null;
  published?: boolean;
  showInSearch?: boolean;
  reraVerified?: boolean;
  city?: string | null;
  locality?: string | null;
  reraNumber?: string | null;
  status: ConstructionStatus;
  minPrice?: string | null;
  maxPrice?: string | null;
  pricePerUnitLabel?: string | null;
  unitsLabel?: string | null;
  configLabel?: string | null;
  bankCount?: number;
  enquiryCount?: number;
  gradientBg?: string | null;
  accentColor?: string | null;
  constructionProgress?: number | null;
  approvedBanks?: string[] | null;
  amenities?: string[] | null;
  configurations?: InfraProjectConfiguration[] | null;
  infrastructure?: InfraProjectInfrastructure[] | null;
  legal?: Record<string, string> | null;
  roadWidths?: { label: string; width: string }[] | null;
  landmarks?: { name: string; distance: string }[] | null;
  faqs?: { q: string; a: string }[] | null;
  developerInfo?: {
    name?: string;
    founded?: string;
    location?: string;
    highlights?: string[];
  } | null;
  visibility?: string;
  heroImageUrl?: string | null;
  description?: string | null;
  towers?: number | null;
  totalUnits?: number | null;
  availableUnits?: number | null;
  maxFloors?: number | null;
  possessionDate?: string | null;
  isFeatured?: boolean;
  milestones?: InfraProjectMilestone[];
  createdAt?: string;
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
