import { PartialType } from '@nestjs/swagger';
import { CreatePropertyPremiumPlanDto } from './create-plan.dto';

export class UpdatePropertyPremiumPlanDto extends PartialType(CreatePropertyPremiumPlanDto) {}
