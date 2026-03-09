import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  ValidateNested,
  IsArray,
  IsDate,
  IsDateString,
  IsInt,
} from 'class-validator';
import {
  LocationHub,
  OwnershipType,
} from '../entities/property-details/commercialAttributes.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SizeWithUnitDto } from 'src/company-onboarding/dto/company-onboarding.dto';
import { BHKType, facingType, WaterAvailability } from '../enums/property.enum';
import { PromotionTypeEnum } from '../../company-onboarding/Enum/company.enum';
const emptyToUndefined = () =>
  Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  );

export class BasicDetailsDto {
  @IsEnum(['Owner', 'Builder', 'Agent'])
  @IsOptional()
  ownerType: string;

  @IsEnum(['Residential', 'Commercial'])
  @IsOptional()
  purpose: string;

  @ApiProperty()
  @IsEnum(['Rent', 'Sell', 'Flat Share'])
  @IsOptional()
  lookingType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  phone: number;
}
export class CreateBasicDetailsPayloadDto {
  @ApiProperty()
  @IsString()
  postedByUserId: string;

  @ValidateNested()
  @Type(() => BasicDetailsDto)
  basicDetails: BasicDetailsDto;
}

export class LocationDetailsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  locality: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  subLocality?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  latitude?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  longitude?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  place_id?: string;
}
export class UpdateLocationDetailsDto {
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  locationDetails: LocationDetailsDto;
}
export class FlatshareAttributesDto {
  @ApiProperty()
  @IsString()
  lookingFor: string;

  @ApiProperty()
  @IsString()
  occupancy: string;

  @ApiProperty({ enum: WaterAvailability })
  @IsEnum(WaterAvailability)
  @IsOptional()
  waterAvailability?: WaterAvailability;

  @ApiProperty({ enum: BHKType })
  @IsEnum(BHKType)
  bhk: BHKType;

  @ApiProperty({ enum: facingType })
  @IsEnum(facingType)
  facing: facingType;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  bathroom: number | null;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  balcony: number | null;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  floorArea: SizeWithUnitDto | null;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  totalFloors: number | null;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  currentFloor: number | null;

  @ApiProperty()
  @IsBoolean()
  parking2w: boolean;

  @ApiProperty()
  @IsBoolean()
  parking4w: boolean;
}

export class MediaDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  propertyImages: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  propertyVideo: string[];
}
export class UpdateMediaDetailsDto {
  @ValidateNested()
  @Type(() => MediaDetailsDto)
  mediaDetails: MediaDetailsDto;
}

class ResidentialAttributesDto {
  @ApiProperty({ enum: BHKType })
  @IsOptional()
  @IsEnum(BHKType)
  bhk?: BHKType;

  @ApiProperty({ enum: facingType })
  @IsOptional()
  @IsEnum(facingType)
  facing?: facingType;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  floorArea?: SizeWithUnitDto;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  buildupArea?: SizeWithUnitDto;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  balcony?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalFloors?: number; // New field for total floors

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  currentFloor?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  parking2w?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  parking4w?: boolean;
}

class FurnishingDto {
  @ApiProperty()
    @emptyToUndefined()
  @IsOptional()
  @IsEnum(['Fully Furnished', 'Semi Furnished', 'Unfurnished'])
  furnishedType: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  furnishings?: string[];
}

class PricingDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maintenanceCharges?: number; // New field for maintenance charges

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  securityDeposit?: number; // New field for security deposit

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  expectedPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  pricePerSqft?: number; // Important for selling

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  advanceAmount?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maxPriceOffer?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  minPriceOffer?: number;
}

class PlotAttributesDto {
  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  plotArea: SizeWithUnitDto; // in sqft

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  length?: SizeWithUnitDto; // in feet or meters

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  width?: SizeWithUnitDto; // in feet or meters

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @Type(() => SizeWithUnitDto)
  widthFacingRoad?: SizeWithUnitDto; // Width of the road facing the plot

  @ApiProperty()
  @IsOptional()
  @IsEnum([
    'North',
    'South',
    'East',
    'West',
    'North-East',
    'North-West',
    'South-East',
    'South-West',
  ])
  facing: string;

  @ApiProperty()
  @IsEnum(['Immediate', 'Future'])
  possessionStatus: string; // Immediate or Future

  @ApiProperty()
  @IsOptional()
  @IsString()
  possessionDate?: string; // Required if possessionStatus is "Future"

  @ApiProperty()
  @IsEnum(['Resale', 'New Booking'])
  transactionType: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  boundaryWall?: boolean; // True if the plot has a boundary wall

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  noOfFloorsAllowed?: number; // Number of floors allowed for construction
}

class OccupancyDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Any'])
  lookingFor: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Single', 'Shared', 'Any'])
  occupancy: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  privateProfile: boolean;
}

class ConstructionStatusDto {
  @ApiProperty()
    @emptyToUndefined()
  @IsOptional()
  @IsEnum(['Ready to Move', 'Under Construction', 'Newly Launched'])
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ageOfProperty?: number; // Required if status is 'Ready to Move'

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  possessionYears?: number; // Required if status is 'Under Construction' or 'Newly Launched'

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  possessionBy?: Date;
}

class CommercialAttributesDto {
  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  entranceAreaWidth: SizeWithUnitDto;
  
  @ApiProperty({ type: [String], required: false })
@IsOptional()
@IsArray()
@IsString({ each: true })
suitableFor: string[];


  @ApiProperty({ type: SizeWithUnitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  entranceAreaHeight: SizeWithUnitDto;

  @ApiProperty()
  @IsOptional()
  @IsEnum([
    'Freehold',
    'Leasehold',
    'Joint Tenancy',
    'Cooperative Society',
    'Partnership',
    'Cooperative',
    'Power of attorney',
  ])
  ownership: OwnershipType;

  @ApiProperty()
  @IsOptional()
  @IsEnum([
    'IT Park',
    'Business Park',
    'Commertial',
    'Residential',
    'Retail',
    'Market',
    'Others',
  ])
  locationHub: LocationHub;

  @ApiProperty({ type: SizeWithUnitDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeWithUnitDto)
  builtUpArea: SizeWithUnitDto;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalFloors: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  currentFloor: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  twoWheelerParking: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  fourWheelerParking: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  staircases: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  passengerLifts: number;
}

class FacilitiesDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  minSeats: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  numberOfCabins: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  numberOfMeetingRooms: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
 numberOfWashrooms: number;
}
export class PropertyDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum([
    'Apartment',
    'Independent Floor',
    'Villa',
    'Independent House',
    'Plot',
    'Agriculture Land',
    'Office',
    'Retail Shop',
    'Show Room',
  ])
  propertyType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  propertyName: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => ResidentialAttributesDto)
  residentialAttributes?: ResidentialAttributesDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => PlotAttributesDto)
  plotAttributes?: PlotAttributesDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => CommercialAttributesDto)
  commercialAttributes?: CommercialAttributesDto;

  // @ApiProperty()
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => FlatshareAttributesDto)
  // flatshareAttributes?: FlatshareAttributesDto;
  @ApiProperty({ required: false, type: () => FlatshareAttributesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FlatshareAttributesDto)
  flatshareAttributes?: FlatshareAttributesDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => FacilitiesDto)
  facilities?: FacilitiesDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingDetailsDto)
  pricingDetails?: PricingDetailsDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => FurnishingDto)
  furnishing?: FurnishingDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConstructionStatusDto)
  constructionStatus?: ConstructionStatusDto;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => OccupancyDetailsDto)
  occupancyDetails?: OccupancyDetailsDto;
}

export class CreatePropertyDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  currentStep?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPosted?: boolean;

  @ApiProperty()
  @ValidateNested()
  @Type(() => BasicDetailsDto)
  @IsOptional()
  basicDetails?: BasicDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  @IsOptional()
  locationDetails?: LocationDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  @IsOptional()
  propertyDetails?: PropertyDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => MediaDetailsDto)
  @IsOptional()
  mediaDetails?: MediaDetailsDto;
}

export class PromotionUpdateDto {
  @ApiProperty({
    enum: PromotionTypeEnum,
    isArray: true,
    description: 'Type of promotion to apply',
    example: [PromotionTypeEnum.Featured, PromotionTypeEnum.Premium],
  })
  @IsEnum(PromotionTypeEnum, { each: true })
  @IsArray()
  promotionType: PromotionTypeEnum[];

  @ApiProperty({
    type: Date,
    format: 'date-time',
    description: 'Optional expiry date for promotion',
    example: '2025-04-10T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  promotionExpiry?: Date;

  @ApiProperty({
    type: String,
    description: 'Admin username or ID who approved this',
    example: 'adminUser1',
  })
  @IsString()
  approvedBy: string;

  @ApiProperty({
    type: String,
    description: 'Admin username or ID who updated this',
    example: 'adminUser1',
  })
  @IsString()
  updatedBy: string;

  @ApiProperty({
    type: [String],
    description: 'Optional tags for display/filtering (e.g. Top, Trending, Collab)',
    example: ['Collab', 'Partner'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  promotionTags?: string[];
}
