import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

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

export class UpdatePaymentDto extends CreatePaymentDto {}

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
  @IsString()
  notes?: string;
}

export class CreateDocumentMetaDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  roomId?: number;

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
