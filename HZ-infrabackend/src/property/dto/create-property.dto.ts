import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ConstructionStatus, ListingFor, PropertyType } from '../../common/enums/infra.enums';
import { PropertyInsightsDto } from './property-insights.dto';

const bool = () =>
  Transform(({ value }) => value === true || value === 'true' || value === '1' || value === 1);

export class CreatePropertyDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsOptional()
  @IsEnum(ListingFor)
  listingFor?: ListingFor;

  @ValidateIf((o: CreatePropertyDto) => !['Land', 'Plot', 'Farmhouse'].includes(o.propertyType))
  @IsEnum(ConstructionStatus)
  constructionStatus?: ConstructionStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  bhkType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  carpetArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtUpArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  superBuiltUpArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  plotArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  landArea?: number;

  @IsOptional()
  @IsString()
  areaUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  floorNumber?: number;

  /** Legacy alias mapped to floorNumber in service */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalFloors?: number;

  @IsOptional()
  @IsString()
  towerName?: string;

  @IsOptional()
  @IsString()
  facing?: string;

  @IsOptional()
  @IsString()
  parkingType?: string;

  @IsOptional()
  @IsString()
  furnishingStatus?: string;

  @IsOptional()
  @IsString()
  possessionDate?: string;

  @IsOptional()
  @IsString()
  numberOfFloors?: string;

  @IsOptional()
  @IsString()
  linkedProjectId?: string;

  @IsOptional()
  @IsString()
  landUseType?: string;

  @IsOptional()
  @IsString()
  approvalAuthority?: string;

  @IsOptional()
  @IsString()
  approvalType?: string;

  @IsOptional()
  @IsString()
  approvalNumber?: string;

  @IsOptional()
  @IsString()
  surveyNumber?: string;

  @IsOptional()
  @IsString()
  layoutName?: string;

  @IsOptional()
  @IsString()
  roadWidth?: string;

  @IsOptional()
  @IsString()
  zoneType?: string;

  @IsOptional()
  @IsString()
  waterSource?: string;

  @IsOptional()
  @IsString()
  electricity?: string;

  @IsOptional()
  @IsString()
  plotNumber?: string;

  @IsOptional()
  @IsBoolean()
  @bool()
  isCornerPlot?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isGatedLayout?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasCompoundWall?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isReadyToRegister?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasEBConnection?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasBorewell?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasDrainage?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isPattaAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isTitleClear?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isGatedCommunity?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isVastuCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasPrivatePool?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasGarden?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasSmartHome?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  hasEVCharging?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerUnit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gstPercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  registrationPercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maintenanceDeposit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  otherCharges?: number;

  @IsOptional()
  @IsString()
  reraNumber?: string;

  @IsOptional()
  @IsString()
  reraExpiry?: string;

  @IsOptional()
  @IsString()
  promoterName?: string;

  @IsOptional()
  @IsBoolean()
  @bool()
  isReraVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isEcVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isHouznextVerified?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  reraCertUrl?: string;

  @IsOptional()
  @IsString()
  ecCertUrl?: string;

  @IsOptional()
  @IsString()
  floorPlanUrl?: string;

  @IsOptional()
  @IsString()
  brochureUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  youtubeVideoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsBoolean()
  @bool()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  isZeroBrokerage?: boolean;

  @IsOptional()
  @IsBoolean()
  @bool()
  enableWhatsappEnquiry?: boolean;

  @IsOptional()
  @IsString()
  approvalStatus?: 'approved' | 'pending' | 'draft';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @IsString()
  ownerEmail?: string;

  @IsOptional()
  @IsString()
  ownerAlternatePhone?: string;

  @IsOptional()
  @IsString()
  listedBy?: string;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @ValidateNested()
  @Type(() => PropertyInsightsDto)
  insights?: PropertyInsightsDto | null;
}
