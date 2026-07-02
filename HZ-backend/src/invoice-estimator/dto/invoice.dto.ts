import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsIn,
  Matches,
  Min,
  IsInt,
  IsDateString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Type, Transform, Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VALID_GST_RATES } from '../constants/indian-states.constant';

const emptyToUndefined = ({ value }: { value: unknown }) => {
  if (value === '' || value === null) return undefined;
  return value;
};

export class InvoiceItemInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_name?: string;

  @ApiProperty()
  @IsString()
  item_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4,8}$/, { message: 'HSN/SAC must be 4-8 digits' })
  hsn_sac_code?: string;

  @ApiProperty({ enum: ['unit', 'area'] })
  @IsIn(['unit', 'area'])
  pricing_mode: 'unit' | 'area';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit_label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unit_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  area_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area_unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rate_per_unit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['percent', 'amount'])
  item_discount_type?: 'percent' | 'amount';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  item_discount_value?: number;

  @ApiPropertyOptional({ default: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsIn(VALID_GST_RATES as unknown as number[])
  gst_rate?: number;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: ['interiors', 'furniture', 'mixed'] })
  @IsOptional()
  @IsIn(['interiors', 'furniture', 'mixed'])
  invoice_type?: 'interiors' | 'furniture' | 'mixed';

  @ApiProperty()
  @IsString()
  bill_to_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format',
  })
  bill_to_gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bill_to_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  bill_to_city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bill_to_state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}$/)
  bill_to_state_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(/^[0-9]{6}$/)
  bill_to_pincode?: string;

  @ApiProperty()
  @IsString()
  bill_to_mobile: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bill_to_email?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ship_to_same_as_bill?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_state_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_pincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ship_to_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiProperty()
  @IsString()
  invoice_date: string;

  @ApiProperty()
  @IsString()
  invoice_due: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['percent', 'amount'])
  invoice_discount_type?: 'percent' | 'amount';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  invoice_discount_value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additional_work_details?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prepared_by_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prepared_by_role?: string;

  @ApiPropertyOptional({ enum: ['payment_due', 'paid', 'partially_paid'] })
  @IsOptional()
  @IsIn(['payment_due', 'paid', 'partially_paid'])
  payment_status?: 'payment_due' | 'paid' | 'partially_paid';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount_paid?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_paid?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balance_due?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_payment_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_payment_method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_state_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_pan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_bank_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_bank_account?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_bank_ifsc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier_upi_id?: string;

  @ApiProperty({ type: [InvoiceItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  items: InvoiceItemInputDto[];

  // Strip computed fields if client sends them
  @Exclude()
  subtotal?: number;

  @Exclude()
  grand_total?: number;
}

export class UpdateInvoiceDto extends CreateInvoiceDto {}

export class InvoiceListFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['interiors', 'furniture', 'mixed'])
  invoice_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class RecordPaymentDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsDateString()
  payment_date: string;

  @ApiProperty({ enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'other'] })
  @IsIn(['cash', 'upi', 'bank_transfer', 'cheque', 'card', 'other'])
  payment_method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelInvoiceDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

export class SendInvoiceDto {
  @ApiProperty()
  @IsEmail()
  customer_email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email_subject?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  email_body: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  send_whatsapp?: boolean;
}
