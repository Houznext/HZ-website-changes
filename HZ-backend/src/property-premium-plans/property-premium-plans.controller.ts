import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard, RequestUser } from 'src/guard';
import { CreatePropertyPremiumPlanDto } from './dto/create-plan.dto';
import { UpdatePropertyPremiumPlanDto } from './dto/update-plan.dto';
import { ApplyFreePromotionDto } from './dto/apply-free-promotion.dto';
import { PropertyPremiumPlansService } from './property-premium-plans.service';

type RequestWithUser = { user: RequestUser };

@ApiTags('Property Premium Plans')
@Controller('property-premium-plans')
export class PropertyPremiumPlansController {
  constructor(
    private readonly plansService: PropertyPremiumPlansService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List active premium plans (public)',
    description:
      'Used by property listers to choose a plan to add to cart. Same cart/checkout/order/payment flow as ecommerce.',
  })
  async list() {
    return this.plansService.findAllActive();
  }

  @Get('admin/all')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Admin: list all plans (active + inactive)' })
  async listAll() {
    return this.plansService.findAll();
  }

  @Post()
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Admin: create a premium plan' })
  @ApiBody({ type: CreatePropertyPremiumPlanDto })
  async create(@Body() dto: CreatePropertyPremiumPlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Admin: update a premium plan' })
  @ApiBody({ type: UpdatePropertyPremiumPlanDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyPremiumPlanDto) {
    return this.plansService.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single premium plan by ID' })
  async getById(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post('admin/apply-free-promotion')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({
    summary: 'Admin: apply free promotion to a property',
    description:
      'Apply a premium plan to a property without payment (e.g. collabs, partnerships). ' +
      'Requires admin auth. Used by dreamcasaadmin. Provide either planId or planSlug.',
  })
  @ApiBody({ type: ApplyFreePromotionDto })
  async applyFreePromotion(
    @Body() dto: ApplyFreePromotionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.plansService.applyFreePromotionToProperty(dto, req.user.id);
  }
}
