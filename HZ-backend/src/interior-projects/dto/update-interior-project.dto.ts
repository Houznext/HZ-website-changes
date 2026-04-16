import { PartialType } from '@nestjs/mapped-types';
import { CreateInteriorProjectDto } from './create-interior-project.dto';

export class UpdateInteriorProjectDto extends PartialType(CreateInteriorProjectDto) {}
