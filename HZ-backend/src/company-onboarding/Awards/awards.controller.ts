import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { AwardsDto } from '../dto/company-onboarding.dto';
import { Award } from './entity/company-awards.entity';
import { AwardService } from './awards.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Awards')
@Controller('company-awards/:companyId')
export class AwardController {
  constructor(private readonly awardService: AwardService) {}

  @Post()
  @ApiOperation({
    summary: 'Add an award to a company',
    description: 'Creates and associates a new award with a company.',
  })
  @ApiResponse({
    status: 201,
    description: 'Award successfully created and associated with the company.',
    type: Award,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload.',
  })
  async addAward(
    @Param('companyId') companyId: string,
    @Body() awardDto: AwardsDto,
  ): Promise<Award> {
    return this.awardService.addAwardToCompany(companyId, awardDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all awards of a company',
    description: 'Retrieves a list of all awards associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of awards retrieved successfully.',
    type: [Award],
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found or has no awards.',
  })
  async getAwards(@Param('companyId') companyId: string): Promise<Award[]> {
    return this.awardService.getAwardsOfCompanies(companyId);
  }

  @Patch(':awardId')
  @ApiOperation({
    summary: 'Update an award of a company',
    description: 'Updates an existing award associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Award successfully updated.',
    type: Award,
  })
  @ApiResponse({
    status: 404,
    description: 'Award or company not found.',
  })
  async updateAward(
    @Param('companyId') companyId: string,
    @Param('awardId') awardId: string,
    @Body() awardDto: Partial<AwardsDto>,
  ): Promise<Award> {
    return this.awardService.updateAward(companyId, awardId, awardDto);
  }

  @Delete(':awardId')
  @ApiOperation({
    summary: 'Delete an award from a company',
    description: 'Deletes an award associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Award successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Award or company not found.',
  })
  async deleteAward(
    @Param('companyId') companyId: string,
    @Param('awardId') awardId: string,
  ): Promise<void> {
    return this.awardService.deleteAward(companyId, awardId);
  }
}
