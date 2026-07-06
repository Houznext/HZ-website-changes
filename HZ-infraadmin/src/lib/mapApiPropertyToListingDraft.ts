import type { ListingDraft } from '@/context/ListingFormContext';
import { LISTING_FORM_DEFAULTS } from '@/context/ListingFormContext';
import { needsConstructionStatus } from '@/lib/propertyListingHelpers';
import { apiInsightsToForm } from '@/lib/insightsHelpers';

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function formatListedBy(v: unknown): string {
  const s = str(v).toLowerCase();
  if (s === 'houznext') return 'Houznext';
  if (s === 'developer') return 'Developer';
  if (s === 'public') return 'Public';
  if (s === 'owner') return 'Owner';
  return str(v) || 'Houznext';
}

function approvalFromEntity(isApproved?: boolean, isActive?: boolean): string {
  if (isApproved && isActive) return 'approved';
  if (!isApproved && !isActive) return 'draft';
  return 'pending';
}

function mergePhotoUrls(raw: Record<string, unknown>): string[] {
  const direct = (raw.photoUrls as string[])?.filter(Boolean) ?? [];
  const media = (raw.media as { url?: string; sortOrder?: number }[]) ?? [];
  const fromMedia = [...media]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => m.url)
    .filter(Boolean) as string[];
  return Array.from(new Set([...direct, ...fromMedia]));
}

function dateInput(iso: unknown): string {
  const s = str(iso);
  if (!s) return '';
  return s.slice(0, 10);
}

/** Maps GET /admin/properties/:id JSON into listing wizard draft. */
export function mapApiPropertyToListingDraft(api: Record<string, unknown>): ListingDraft {
  const photos = mergePhotoUrls(api);
  const cover = str(api.coverImageUrl) || photos[0] || '';

  const propertyType = str(api.propertyType) || 'Apartment';

  return {
    ...LISTING_FORM_DEFAULTS,
    title: str(api.title),
    propertyType,
    listingFor: str(api.listingFor) || 'Buy',
    constructionStatus: needsConstructionStatus(propertyType)
      ? str(api.constructionStatus) || 'Ready to Move'
      : undefined,
    city: str(api.city),
    locality: str(api.locality),
    address: str(api.address),
    pincode: str(api.pincode),
    description: str(api.description),
    ownerName: str(api.ownerName),
    ownerPhone: str(api.ownerPhone),
    ownerEmail: str(api.ownerEmail),
    ownerAlternatePhone: str(api.ownerAlternatePhone),
    listedBy: formatListedBy(api.listedBy),
    leadSource: str(api.leadSource) || 'Website',
    branch: str(api.branch),
    internalNotes: str(api.internalNotes),
    bhkType: str(api.bhkType),
    carpetArea: num(api.carpetArea),
    builtUpArea: num(api.builtUpArea),
    superBuiltUpArea: num(api.superBuiltUpArea),
    floorNumber: num(api.floorNumber),
    totalFloors: num(api.totalFloors),
    towerName: str(api.towerName),
    facing: str(api.facing),
    parkingType: str(api.parkingType),
    furnishingStatus: str(api.furnishingStatus),
    possessionDate: str(api.possessionDate),
    linkedProjectId: str(api.linkedProjectId),
    amenities: Array.isArray(api.amenities) ? [...(api.amenities as string[])] : [],
    plotArea: num(api.plotArea),
    landArea: num(api.landArea),
    areaUnit: str(api.areaUnit) || 'Sqyds',
    numberOfFloors: str(api.numberOfFloors),
    landUseType: str(api.landUseType),
    approvalAuthority: str(api.approvalAuthority),
    surveyNumber: str(api.surveyNumber),
    layoutName: str(api.layoutName),
    roadWidth: str(api.roadWidth),
    zoneType: str(api.zoneType),
    waterSource: str(api.waterSource),
    electricity: str(api.electricity),
    plotNumber: str(api.plotNumber),
    approvalType: str(api.approvalType),
    approvalNumber: str(api.approvalNumber),
    basePrice: num(api.basePrice),
    gstPercent: num(api.gstPercent) ?? 5,
    registrationPercent: num(api.registrationPercent) ?? 1,
    maintenanceDeposit: num(api.maintenanceDeposit) ?? 0,
    otherCharges: num(api.otherCharges) ?? 0,
    reraNumber: str(api.reraNumber),
    reraExpiry: dateInput(api.reraExpiry),
    promoterName: str(api.promoterName),
    reraCertUrl: str(api.reraCertUrl),
    ecCertUrl: str(api.ecCertUrl),
    floorPlanUrl: str(api.floorPlanUrl),
    brochureUrl: str(api.brochureUrl),
    youtubeVideoUrl: str(api.youtubeVideoUrl),
    photoUrls: photos,
    coverImageUrl: cover,
    highlights: Array.isArray(api.highlights) ? [...(api.highlights as string[])] : [],
    approvalStatus: approvalFromEntity(Boolean(api.isApproved), Boolean(api.isActive)),
    isFeatured: Boolean(api.isFeatured),
    isZeroBrokerage: Boolean(api.isZeroBrokerage),
    enableWhatsappEnquiry: api.enableWhatsappEnquiry !== false,
    isReraVerified: Boolean(api.isReraVerified),
    isTitleClear: Boolean(api.isTitleClear),
    isHouznextVerified: api.isHouznextVerified !== false,
    isEcVerified: Boolean(api.isEcVerified),
    isCornerPlot: Boolean(api.isCornerPlot),
    isGatedLayout: Boolean(api.isGatedLayout),
    hasCompoundWall: Boolean(api.hasCompoundWall),
    isReadyToRegister: Boolean(api.isReadyToRegister),
    hasEBConnection: Boolean(api.hasEBConnection),
    hasBorewell: Boolean(api.hasBorewell),
    hasDrainage: Boolean(api.hasDrainage),
    isPattaAvailable: Boolean(api.isPattaAvailable),
    isGatedCommunity: Boolean(api.isGatedCommunity),
    isVastuCompliant: Boolean(api.isVastuCompliant),
    hasPrivatePool: Boolean(api.hasPrivatePool),
    hasGarden: Boolean(api.hasGarden),
    hasSmartHome: Boolean(api.hasSmartHome),
    hasEVCharging: Boolean(api.hasEVCharging),
    insights: api.insights
      ? apiInsightsToForm(api.insights as Record<string, unknown>, propertyType)
      : null,
  };
}
