export type PropertyType =
  | 'Apartment'
  | 'Villa'
  | 'Land'
  | 'Plot'
  | 'Commercial'
  | 'Row House'
  | 'Studio'
  | 'Farmhouse';

export type ListingFor = 'Buy' | 'Rent';

export type ConstructionStatus = 'Ready to Move' | 'Under Construction' | 'New Launch';

/** Public property payload from GET /properties and GET /properties/:slug */
export interface PublicProperty {
  propertyId: string;
  propertyCode?: string | null;
  slug: string | null;
  title: string;
  propertyType: PropertyType;
  listingFor: ListingFor;
  constructionStatus: ConstructionStatus;
  city?: string | null;
  locality?: string | null;
  address?: string | null;
  pincode?: string | null;
  description?: string | null;
  bhkType?: string | null;
  carpetArea?: string | null;
  builtUpArea?: string | null;
  superBuiltUpArea?: string | null;
  plotArea?: string | null;
  landArea?: string | null;
  areaUnit?: string | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  towerName?: string | null;
  facing?: string | null;
  parkingType?: string | null;
  furnishingStatus?: string | null;
  possessionDate?: string | null;
  numberOfFloors?: string | null;
  landUseType?: string | null;
  approvalAuthority?: string | null;
  approvalType?: string | null;
  approvalNumber?: string | null;
  surveyNumber?: string | null;
  layoutName?: string | null;
  roadWidth?: string | null;
  zoneType?: string | null;
  waterSource?: string | null;
  electricity?: string | null;
  plotNumber?: string | null;
  isCornerPlot?: boolean;
  isGatedLayout?: boolean;
  hasCompoundWall?: boolean;
  isReadyToRegister?: boolean;
  hasEBConnection?: boolean;
  hasBorewell?: boolean;
  hasDrainage?: boolean;
  isPattaAvailable?: boolean;
  isTitleClear?: boolean;
  isGatedCommunity?: boolean;
  isVastuCompliant?: boolean;
  hasPrivatePool?: boolean;
  hasGarden?: boolean;
  hasSmartHome?: boolean;
  hasEVCharging?: boolean;
  basePrice?: string | null;
  pricePerUnit?: string | null;
  gstPercent?: string | null;
  registrationPercent?: string | null;
  maintenanceDeposit?: string | null;
  otherCharges?: string | null;
  totalCost?: string | null;
  reraNumber?: string | null;
  reraExpiry?: string | null;
  promoterName?: string | null;
  isReraVerified?: boolean;
  isEcVerified?: boolean;
  isHouznextVerified?: boolean;
  photoUrls?: string[] | null;
  coverImageUrl?: string | null;
  reraCertUrl?: string | null;
  ecCertUrl?: string | null;
  floorPlanUrl?: string | null;
  brochureUrl?: string | null;
  amenities?: string[] | null;
  highlights?: string[] | null;
  isFeatured?: boolean;
  isZeroBrokerage?: boolean;
  enableWhatsappEnquiry?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
  linkedProjectId?: string | null;
  media?: { mediaId: string; url: string; kind: string; sortOrder: number }[];
  createdAt?: string;
  updatedAt?: string;
}
