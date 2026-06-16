import type { ListingDraft } from '@/context/ListingFormContext';
import { needsConstructionStatus } from '@/lib/propertyListingHelpers';

/** Maps listing wizard draft to HZ-infrabackend CreatePropertyDto shape. */
export function buildCreatePropertyPayload(form: ListingDraft): Record<string, unknown> {
  const carpet = Number(form.carpetArea) || Number(form.builtUpArea) || 0;
  const basePrice = Number(form.basePrice) || 0;
  const gst = Number(form.gstPercent) || 0;
  const reg = Number(form.registrationPercent) || 0;
  const maintenance = Number(form.maintenanceDeposit) || 0;
  const other = Number(form.otherCharges) || 0;
  const totalCost = basePrice + (basePrice * gst) / 100 + (basePrice * reg) / 100 + maintenance + other;

  return {
    title: form.title,
    propertyType: form.propertyType,
    listingFor: form.listingFor,
    ...(needsConstructionStatus(form.propertyType) && form.constructionStatus
      ? { constructionStatus: form.constructionStatus }
      : {}),
    city: form.city,
    locality: form.locality,
    address: form.address,
    pincode: form.pincode,
    description: form.description,
    bhkType: form.bhkType,
    carpetArea: form.carpetArea,
    builtUpArea: form.builtUpArea,
    superBuiltUpArea: form.superBuiltUpArea,
    plotArea: form.plotArea,
    landArea: form.landArea,
    areaUnit: form.areaUnit,
    floorNumber: form.floorNumber,
    totalFloors: form.totalFloors,
    towerName: form.towerName,
    facing: form.facing,
    parkingType: form.parkingType,
    furnishingStatus: form.furnishingStatus,
    possessionDate: form.possessionDate,
    linkedProjectId: form.linkedProjectId,
    numberOfFloors: form.numberOfFloors,
    landUseType: form.landUseType,
    approvalAuthority: form.approvalAuthority,
    approvalType: form.approvalType,
    approvalNumber: form.approvalNumber,
    surveyNumber: form.surveyNumber,
    layoutName: form.layoutName,
    roadWidth: form.roadWidth,
    zoneType: form.zoneType,
    waterSource: form.waterSource,
    electricity: form.electricity,
    plotNumber: form.plotNumber,
    isCornerPlot: form.isCornerPlot,
    isGatedLayout: form.isGatedLayout,
    hasCompoundWall: form.hasCompoundWall,
    isReadyToRegister: form.isReadyToRegister,
    hasEBConnection: form.hasEBConnection,
    hasBorewell: form.hasBorewell,
    hasDrainage: form.hasDrainage,
    isPattaAvailable: form.isPattaAvailable,
    isTitleClear: form.isTitleClear,
    isGatedCommunity: form.isGatedCommunity,
    isVastuCompliant: form.isVastuCompliant,
    hasPrivatePool: form.hasPrivatePool,
    hasGarden: form.hasGarden,
    hasSmartHome: form.hasSmartHome,
    hasEVCharging: form.hasEVCharging,
    isEcVerified: form.isEcVerified,
    isReraVerified: form.isReraVerified,
    isHouznextVerified: form.isHouznextVerified,
    basePrice,
    pricePerUnit: carpet > 0 ? basePrice / carpet : undefined,
    gstPercent: gst,
    registrationPercent: reg,
    maintenanceDeposit: maintenance,
    otherCharges: other,
    totalCost,
    reraNumber: form.reraNumber,
    reraExpiry: form.reraExpiry,
    promoterName: form.promoterName,
    reraCertUrl: form.reraCertUrl,
    ecCertUrl: form.ecCertUrl,
    floorPlanUrl: form.floorPlanUrl,
    brochureUrl: form.brochureUrl,
    youtubeVideoUrl: (() => {
      const t = String(form.youtubeVideoUrl ?? '').trim();
      return t || null;
    })(),
    amenities: form.amenities,
    highlights: form.highlights,
    photoUrls: form.photoUrls,
    coverImageUrl: form.coverImageUrl,
    approvalStatus: form.approvalStatus,
    isFeatured: form.isFeatured,
    isZeroBrokerage: form.isZeroBrokerage,
    enableWhatsappEnquiry: form.enableWhatsappEnquiry,
    ownerName: form.ownerName,
    ownerPhone: form.ownerPhone,
    ownerEmail: form.ownerEmail,
    ownerAlternatePhone: form.ownerAlternatePhone,
    listedBy: form.listedBy,
    leadSource: form.leadSource,
    branch: form.branch,
    internalNotes: form.internalNotes,
  };
}
