import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDraftingDto {
  @ApiProperty()
  @IsString()
  combinationTypes: string;

  @ApiProperty()
  @IsString()
  additionalRequirement: string;
}

export class UpdateDocumentDraftingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  combinationTypes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  
  additionalRequirement?: string;
}
