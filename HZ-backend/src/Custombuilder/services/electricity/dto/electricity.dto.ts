import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsArray } from 'class-validator';
import { SwitchBrands, WireBrands } from '../enum/electricity.enum';

export class CreateElectricityDto {
  @ApiProperty()
  @IsString()
  typeOfWork: string;

  @ApiProperty()
  @IsString()
  wiringType: string;

  @ApiProperty({ enum: WireBrands, default: WireBrands.Havells })
  @IsEnum(WireBrands)
  wireBrand: WireBrands;

  @ApiProperty({ enum: SwitchBrands, default: SwitchBrands.Anchor })
  @IsEnum(SwitchBrands)
  switchBrand: SwitchBrands;

  @ApiProperty()
  @IsInt()
  totalPowerPoints: number;

  @ApiProperty()
  @IsInt()
  totalLights: number;

  @ApiProperty()
  @IsInt()
  totalFans: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  safetyEquipment: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  
  additionalRequirement?: string;
}

export class UpdateElectricityDto extends PartialType(CreateElectricityDto) {}
