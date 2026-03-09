import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ParseArrayPipe,
  UseGuards,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/referral.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // Flow 1: Send Invite
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new referral' })
  @ApiResponse({ status: 201, description: 'Referral successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  createReferral(@Body() dto: CreateReferralDto) {
    return this.referralService.createReferral(dto);
  }

  // Flow 2: Generate Referral Link
  @Get('generate/:referrerId')
  @ApiOperation({ summary: 'Generate referral link for a user' })
  @ApiResponse({
    status: 200,
    description: 'Referral link generated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Referrer not found.' })
  generateReferralLink(@Param('referrerId') referrerId: string) {
    return this.referralService.generateReferralLink(referrerId);
  }

  @Get(':referrerId')
  @ApiOperation({ summary: 'Get referrals by user ID' })
  @ApiResponse({
    status: 200,
    description: 'List of referrals fetched successfully.',
  })
  @ApiResponse({ status: 404, description: 'No referrals found for the user.' })
  getReferralsByUser(@Param('referrerId') referrerId: string) {
    return this.referralService.getReferralsByUser(referrerId);
  }

  @Get('detect/:code')
  @ApiOperation({ summary: 'Detect referrer using referral code' })
  @ApiResponse({ status: 200, description: 'Referrer detected successfully.' })
  detectReferrer(@Param('code') code: string) {
    return this.referralService.detectReferrerByCode(code);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':referralId')
  @ApiOperation({ summary: 'Delete a single referral by ID' })
  @ApiResponse({ status: 200, description: 'Referral deleted successfully.' })
  deleteReferral(@Param('referralId') referralId: string) {
    return this.referralService.deleteReferral(referralId);
  }

  @Get('all/:userId')
  @ApiOperation({
    summary: 'Get all referrals for a user with optional date filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Referrals retrieved successfully.',
  })
  getAllReferrals(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.referralService.getAllReferralsByUser(
      userId,
      startDate,
      endDate,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple referrals' })
  @ApiResponse({
    status: 200,
    description: 'The referrals have been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Some referrals were not found.' })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: [Number],
    description: 'Comma-separated list of referral IDs to delete',
  })
  async deleteMoreReferrals(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: string[],
  ): Promise<void> {
    return this.referralService.deleteMoreReferrals(ids);
  }
}
