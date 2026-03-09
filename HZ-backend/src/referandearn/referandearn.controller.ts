import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { ReferAndEarnService } from './referandearn.service';
import { ListReferAndEarnPropertiesDto } from './dtos/property-referral-agreement.dto';
import {
  CreateReferralCaseDto,
  UpdateReferralCaseByUserDto,
} from './dtos/referral-case.dto';

@ApiTags('Refer & Earn (User)')
@ApiBearerAuth()
// @UseGuards(ControllerAuthGuard)
@Controller('refer-and-earn')
export class ReferAndEarnUserController {
  constructor(private readonly service: ReferAndEarnService) {}

  @Get('properties')
  @ApiOperation({
    summary: 'List Refer & Earn enabled properties (public-safe payload)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'locality', required: false })
  listReferAndEarnProperties(@Query() query: ListReferAndEarnPropertiesDto) {
    return this.service.listReferAndEarnProperties(query);
  }

  @Post('referrals')
  @ApiOperation({
    summary: 'Create a referral case for a property (user/referrer)',
  })
  createReferralCase(@Body() dto: CreateReferralCaseDto) {
    return this.service.createReferralCase(dto);
  }

  @Get('referrals/my/:referrerUserId')
  @ApiOperation({ summary: 'Get my referrals (by referrer user id)' })
  @ApiParam({ name: 'referrerUserId', description: 'Referrer user UUID' })
  getMyReferrals(@Param('referrerUserId') referrerUserId: string) {
    return this.service.getMyReferrals(referrerUserId);
  }

  @Get('referrals/:referralCaseId')
  @ApiOperation({
    summary: 'Get referral case full details (property + logs + assignedTo)',
  })
  @ApiParam({ name: 'referralCaseId', description: 'Referral case UUID' })
  getReferralDetails(@Param('referralCaseId') referralCaseId: string) {
    return this.service.getReferralDetails(referralCaseId as any);
  }

  @Patch('referrals/:referralCaseId')
  @ApiOperation({
    summary:
      'Update referral case (end-user). Allowed only for the case owner & only if OPEN.',
  })
  @ApiParam({ name: 'referralCaseId', description: 'Referral case UUID' })
  updateReferralByUser(
    @Param('referralCaseId') referralCaseId: string,
    @Body() dto: UpdateReferralCaseByUserDto,
  ) {
    return this.service.updateReferralByUser(referralCaseId, dto);
  }

  @Delete('referrals/:referralCaseId')
  @ApiOperation({
    summary:
      'Soft-cancel referral case (end-user). Sets status to CANCELLED and deletedAt; row is not removed. Allowed only for the case owner & only if OPEN.',
  })
  @ApiParam({ name: 'referralCaseId', description: 'Referral case UUID' })
  cancelReferralByUser(
    @Param('referralCaseId') referralCaseId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id;
    return this.service.cancelReferralByUser(referralCaseId, userId);
  }
}
