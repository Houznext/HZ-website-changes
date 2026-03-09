import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShiprocketWebhookDto {
  @ApiProperty()
  awb: string;

  @ApiPropertyOptional()
  courier_name?: string;

  @ApiProperty()
  current_status: string;

  @ApiProperty()
  current_status_id: number;

  @ApiPropertyOptional()
  shipment_status?: string;

  @ApiProperty()
  shipment_status_id: number;

  @ApiProperty()
  current_timestamp: string;

  @ApiPropertyOptional()
  order_id?: string;

  @ApiPropertyOptional()
  etd?: string;

  @ApiPropertyOptional()
  scans?: Array<{
    location: string;
    date: string;
    activity: string;
    status: string;
  }>;
}
