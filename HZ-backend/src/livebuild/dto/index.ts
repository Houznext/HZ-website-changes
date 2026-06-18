import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/)
  mobile: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  customerMobile?: string;

  /** Admin new-project form sends 10-digit phone; mapped to customerMobile on create. */
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerFullName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  otpVerifiedToken?: string;

  @IsOptional()
  customerId?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  siteManager?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  phase?: string;

  @IsOptional()
  @IsString()
  pctMethod?: string;

  @IsOptional()
  overallPct?: number;

  @IsOptional()
  pctOverride?: number;

  @IsOptional()
  @IsString()
  pctOverrideReason?: string;

  @IsOptional()
  @IsString()
  holdReason?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  panoramaUrl?: string;
}

export class UpdateProjectDto extends CreateProjectDto {}

/** Admin: set or change project customer mobile (OTP required). */
export class UpdateProjectCustomerMobileDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  customerMobile?: string;

  @IsString()
  @IsNotEmpty()
  otpVerifiedToken: string;
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  lengthFt?: number;

  @IsOptional()
  widthFt?: number;

  @IsOptional()
  workTypeIds?: number[];

  @IsOptional()
  pct?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  holdReason?: string;

  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  areaSqft?: number;

  @IsOptional()
  @IsString()
  ceilingHeight?: string;

  @IsOptional()
  @IsString()
  flooring?: string;
}

export class UpdateRoomDto extends CreateRoomDto {}

export class AddRoomWorkTypeDto {
  @IsNumber()
  workTypeId: number;
}

export class UpdateRoomWorkTypeDto {
  @IsOptional()
  pct?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateDprDto {
  roomId: number;
  workTypeId: number;

  @IsString()
  date: string;

  @IsOptional()
  pct?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  doneToday?: boolean;

  @IsOptional()
  @IsString()
  submittedBy?: string;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pct: number;

  /** Alias accepted from admin UI / serializers */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pctOfTotal?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paidDate?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class CreateQueryDto {
  @IsOptional()
  roomId?: number;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  customerName?: string;
}

export class ReplyQueryDto {
  @IsString()
  reply: string;

  @IsOptional()
  @IsString()
  repliedBy?: string;
}

export class CreateWorkTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  defaultRooms?: string[];

  @IsOptional()
  requiresPhotos?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  displayOrder?: number;
}

export class UpdateWorkTypeDto extends CreateWorkTypeDto {}

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  otpVerified?: boolean;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsOptional()
  roomId?: number;

  @IsOptional()
  workTypeId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  specification?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  installDate?: string;

  @IsOptional()
  @IsString()
  warrantyPeriod?: string;

  @IsOptional()
  displayOrder?: number;
}

export class UpdateMaterialDto extends CreateMaterialDto {}

export class UpsertPropertyInfoDto {
  @IsOptional()
  @IsString()
  flatNumber?: string;

  @IsOptional()
  @IsString()
  tower?: string;

  @IsOptional()
  totalAreaSqft?: number;

  @IsOptional()
  carpetAreaSqft?: number;

  @IsOptional()
  balconySqft?: number;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  facing?: string;

  @IsOptional()
  @IsString()
  designScope?: string;

  @IsOptional()
  superBuiltUpSqft?: number;

  @IsOptional()
  scopeIncluded?: string[];

  @IsOptional()
  specifications?: { label: string; value: string }[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDocumentMetaDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  roomId?: number | string;

  @IsOptional()
  workTypeId?: number | string;

  @IsOptional()
  @IsString()
  relatedWorkType?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}

export class Create3dModelMetaDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsString()
  modelType?: string;

  @IsOptional()
  floorNumber?: number | string;

  @IsOptional()
  roomId?: number | string;

  @IsOptional()
  isPrimary?: boolean | string;

  @IsOptional()
  cameraPosX?: number | string;

  @IsOptional()
  cameraPosY?: number | string;

  @IsOptional()
  cameraPosZ?: number | string;

  @IsOptional()
  cameraTargetX?: number | string;

  @IsOptional()
  cameraTargetY?: number | string;

  @IsOptional()
  cameraTargetZ?: number | string;
}

export class Update3dModelDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  modelType?: string;

  @IsOptional()
  floorNumber?: number | null;

  @IsOptional()
  roomId?: number | null;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  cameraPosX?: number | null;

  @IsOptional()
  cameraPosY?: number | null;

  @IsOptional()
  cameraPosZ?: number | null;

  @IsOptional()
  cameraTargetX?: number | null;

  @IsOptional()
  cameraTargetY?: number | null;

  @IsOptional()
  cameraTargetZ?: number | null;

  @IsOptional()
  displayOrder?: number;
}

export class Create3dHotspotDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  roomId?: number | null;

  @IsOptional()
  positionX?: number;

  @IsOptional()
  positionY?: number;

  @IsOptional()
  positionZ?: number;

  @IsOptional()
  cameraPosX?: number | null;

  @IsOptional()
  cameraPosY?: number | null;

  @IsOptional()
  cameraPosZ?: number | null;

  @IsOptional()
  cameraTargetX?: number | null;

  @IsOptional()
  cameraTargetY?: number | null;

  @IsOptional()
  cameraTargetZ?: number | null;

  @IsOptional()
  displayOrder?: number;
}

export class Update3dHotspotDto extends Create3dHotspotDto {}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  dpr?: boolean;

  @IsOptional()
  @IsBoolean()
  query?: boolean;

  @IsOptional()
  @IsBoolean()
  payment?: boolean;

  @IsOptional()
  @IsBoolean()
  hold?: boolean;

  @IsOptional()
  @IsBoolean()
  doc?: boolean;
}
