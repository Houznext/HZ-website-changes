export interface PortfolioProject {
  id: string
  bhk: string | null
  propertyType: string | null
  totalAreaSqft: number | null
  locality: string | null
  city: string | null
  stylePreference: string | null
  scopesSelected: string[] | null
  packageTier: string | null
  deliveredInDays: number | null
  projectStory: string | null
  customerTestimonial: string | null
  customerName: string | null
  customerRating: number | null
  portfolioPhotoUrls: string[] | null
  actualEndDate: string | null
  handoverDate: string | null
  isHandedOver: boolean | null
  rep: {
    id: string
    fullName: string
    city?: string | null
  } | null
  trades: Array<{
    id: string
    overallProgress: number | null
    template: { name: string } | null
  }>
}

export interface DerivedProject extends PortfolioProject {
  displayName: string
  locationFull: string
  packageLabel: string
  styleLabel: string
  daysLabel: string
  areaLabel: string
  photoUrls: string[]
  designerInitials: string
  deliveredMonth: string
  cardHeight: number
}

export type PackageKey = 'Essential' | 'Premium' | 'Luxury' | string
export type FilterType = 'all' | '2bhk' | '3bhk' | 'villa' | string
export type FilterStyle = 'all' | string
export type FilterCity = 'all' | string
export type SortOrder = 'newest' | 'oldest' | 'fastest'
