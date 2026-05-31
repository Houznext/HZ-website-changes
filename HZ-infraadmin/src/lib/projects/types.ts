import type { ProjectTypeKey } from './constants';

export type ProjectMilestoneDraft = {
  label: string;
  date?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
};

export type ProjectConfigDraft = {
  type: string;
  area?: string;
  basePrice?: string;
  allInclusive?: string;
  availability?: string;
  units?: string;
};

export type InfraStatusDraft = {
  label: string;
  status: string;
};

export type PlotSizeDraft = {
  dimensions: string;
  sqyds: string;
  ratePerSqyd?: string;
  totalPrice?: string;
};

export type ProjectRecord = {
  projectId: string;
  name: string;
  slug?: string | null;
  projectType: ProjectTypeKey;
  developerName?: string | null;
  refCode?: string | null;
  published: boolean;
  showInSearch: boolean;
  reraVerified: boolean;
  city?: string | null;
  locality?: string | null;
  reraNumber?: string | null;
  totalUnits?: number | null;
  availableUnits?: number | null;
  towers?: number | null;
  maxFloors?: number | null;
  possessionDate?: string | null;
  status: string;
  minPrice?: string | null;
  maxPrice?: string | null;
  pricePerUnitLabel?: string | null;
  unitsLabel?: string | null;
  configLabel?: string | null;
  bankCount: number;
  enquiryCount: number;
  gradientBg?: string | null;
  accentColor?: string | null;
  constructionProgress?: number | null;
  visibility?: string | null;
  description?: string | null;
  heroImageUrl?: string | null;
  isFeatured: boolean;
  approvedBanks?: string[] | null;
  amenities?: string[] | null;
  configurations?: ProjectConfigDraft[] | null;
  infrastructure?: InfraStatusDraft[] | null;
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
  createdAt?: string;
  updatedAt?: string;
  milestones?: {
    milestoneId?: string;
    label: string;
    date?: string | null;
    isCompleted?: boolean;
    isCurrent?: boolean;
    sortOrder?: number;
  }[];
};
