import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const toBool = () =>
  Transform(({ value }) => value === true || value === 'true' || value === '1' || value === 1);

export class LandmarkDto {
  @IsString()
  name: string;

  @IsString()
  distance: string;
}

export class CompSaleDto {
  @IsString()
  name: string;

  @IsString()
  area: string;

  @IsString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_per_unit: number;
}

export class PropertyInsightsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_current: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_5y_ago: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_10y_ago: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_peak: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  demand_score: number;

  @IsIn(['sqft', 'sqyd', 'acre'])
  price_unit: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  rental_yield?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  cagr?: number;

  @IsOptional()
  @IsString()
  hold_period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  vacancy_rate?: number;

  @IsOptional()
  @IsString()
  new_supply?: string;

  @IsOptional()
  @IsString()
  rental_rate_monthly?: string;

  @IsOptional()
  @IsIn(['converted', 'not_converted', 'patta'])
  na_conversion?: string;

  @IsOptional()
  @IsBoolean()
  @toBool()
  patta_available?: boolean;

  @IsOptional()
  @IsString()
  lp_number?: string;

  @IsOptional()
  @IsIn(['HMDA', 'DTCP', 'RERA', 'GHMC', 'Panchayat'])
  approval_authority?: string;

  @IsOptional()
  @IsString()
  road_width_main?: string;

  @IsOptional()
  @IsString()
  road_width_internal?: string;

  @IsOptional()
  @IsString()
  locality_rank?: string;

  @IsOptional()
  @IsString()
  sro_registrations?: string;

  @IsOptional()
  @IsString()
  infra_boost?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandmarkDto)
  @ArrayMaxSize(4)
  landmarks?: LandmarkDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proj_year_1?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proj_year_2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proj_year_3?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proj_year_4?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proj_year_5?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompSaleDto)
  @ArrayMaxSize(5)
  comps?: CompSaleDto[];

  @IsBoolean()
  @toBool()
  show_insights: boolean;

  @IsBoolean()
  @toBool()
  show_price_chart: boolean;

  @IsBoolean()
  @toBool()
  show_demand_chart: boolean;

  @IsBoolean()
  @toBool()
  show_yield_chart: boolean;

  @IsBoolean()
  @toBool()
  show_projections: boolean;

  @IsBoolean()
  @toBool()
  show_comps: boolean;
}
