import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { ReferAndEarnService } from './referandearn.service';
import {
  CreateReferralAgreementDto,
  ListReferAndEarnPropertiesDto,
  UpdateAgreementStatusDto,
  UpdateReferralAgreementDto,
} from './dtos/property-referral-agreement.dto';
import { ReferAndEarnStatus } from './enum/refer-and-earn.enum';
import {
  ListReferralCasesDto,
  UpdateReferralCaseStepDto,
} from './dtos/referral-case.dto';

@ApiTags('Refer & Earn (Admin)')
@UseGuards(ControllerAuthGuard)
@Controller('refer-and-earn/admin')
export class ReferAndEarnAdminController {
  constructor(private readonly service: ReferAndEarnService) {}

  @Post('/agreement')
  @ApiOperation({
    summary: 'Create Refer & Earn agreement for a property (PENDING)',
  })
  @ApiBody({ type: CreateReferralAgreementDto })
  async createAgreement(@Body() dto: CreateReferralAgreementDto) {
    return this.service.createAgreement(dto);
  }

  @Patch('/agreement/:id/status')
  @ApiOperation({
    summary: 'Update agreement status (ACTIVE/PAUSED/REJECTED/EXPIRED)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Agreement ID' })
  @ApiBody({ type: UpdateAgreementStatusDto })
  async updateAgreementStatus(
    @Param('id') id: number,
    @Body() dto: UpdateAgreementStatusDto,
  ) {
    return this.service.updateAgreementStatus(id, dto);
  }

  @Get('/agreements')
  @ApiOperation({ summary: 'List agreements (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ReferAndEarnStatus })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'locality', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listAgreements(@Query() query: ListReferAndEarnPropertiesDto) {
    return this.service.listAgreements(query);
  }

  // ✅ Admin Referral Pipeline (list + update step)
  @Get('/referrals')
  @ApiOperation({ summary: 'Admin list referral cases (pipeline view)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'referrerUserId', required: false, type: Number })
  @ApiQuery({ name: 'propertyId', required: false, type: Number })
  @ApiQuery({ name: 'step', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async adminListReferrals(@Query() query: ListReferralCasesDto) {
    return this.service.adminListReferrals(query);
  }

  @Patch('/referrals/:id/step')
  @ApiOperation({
    summary: 'Admin update referral progress step (creates step log)',
  })
  @ApiParam({ name: 'id', description: 'Referral case UUID' })
  @ApiBody({ type: UpdateReferralCaseStepDto })
  async updateReferralStep(
    @Param('id') id: string,
    @Body() dto: UpdateReferralCaseStepDto,
  ) {
    return this.service.updateReferralStep(id as any, dto);
  }

  @Patch('agreements/:agreementId')
  @ApiOperation({ summary: 'Edit agreement fields (no status change)' })
  @ApiParam({ name: 'agreementId', type: Number })
  updateAgreement(
    @Param('agreementId') agreementId: number,
    @Body() dto: UpdateReferralAgreementDto,
  ) {
    return this.service.updateAgreement(agreementId, dto);
  }

  @Delete('agreements/:agreementId')
  @ApiOperation({
    summary: 'Delete agreement (and disable refer & earn on property safely)',
  })
  @ApiParam({ name: 'agreementId', type: Number })
  deleteAgreement(
    @Param('agreementId' ) agreementId: number,
    @Query('adminUserId') adminUserId: string,
  ) {
    return this.service.deleteAgreement(agreementId, adminUserId);

  }
  @Get('/agreements/property/:propertyId')
@ApiOperation({ summary: 'Get Refer & Earn agreements by propertyId' })
@ApiParam({
  name: 'propertyId',
  type: String,
  description: 'Property ID',
})
async getAgreementsByProperty(
  @Param('propertyId') propertyId: string,
) {
  return this.service.getAgreementsByProperty(propertyId);
}
}
