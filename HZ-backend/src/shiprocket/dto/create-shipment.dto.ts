import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  orderId: string;
}

export class ServiceabilityDto {
  @ApiProperty()
  @IsString()
  pickupPincode: string;

  @ApiProperty()
  @IsString()
  deliveryPincode: string;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  codAmount?: number;
}
