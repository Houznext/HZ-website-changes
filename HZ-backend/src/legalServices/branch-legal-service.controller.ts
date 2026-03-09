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
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard, RequestUser } from 'src/guard';
import { BranchLegalServiceService } from './branch-legal-service.service';
import {
  CreateBranchLegalServiceDto,
  UpdateBranchLegalServiceDto,
} from '../branch/dto/branch-legal-service.dto';

type RequestWithUser = { user: RequestUser };

@ApiTags('Branches')
@Controller('branches')
export class BranchLegalServiceController {
  constructor(
    private readonly legalService: BranchLegalServiceService,
  ) {}

  @Get(':branchId/legal-services')
  @ApiOperation({
    summary: 'List active legal services for a branch (public)',
    description: 'Returns active legal services only. Use for public legal services page.',
  })
  @ApiParam({ name: 'branchId', description: 'Branch UUID' })
  async listPublic(@Param('branchId') branchId: string) {
    return this.legalService.findActiveByBranch(branchId);
  }

  @Get(':branchId/legal-services/manage')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({
    summary: 'List all legal services for branch (branch staff)',
    description: 'Returns all legal services (active + inactive). Requires branch access.',
  })
  @ApiParam({ name: 'branchId' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async listManage(
    @Param('branchId') branchId: string,
    @Req() req: RequestWithUser,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const onlyActive = activeOnly === 'true';
    return this.legalService.findAllByBranch(branchId, onlyActive, req.user);
  }

  @Get(':branchId/legal-services/:id')
  @ApiOperation({ summary: 'Get one legal service by id' })
  @ApiParam({ name: 'branchId' })
  @ApiParam({ name: 'id' })
  async getOne(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
  ) {
    return this.legalService.findOne(id, branchId);
  }

  @Post(':branchId/legal-services')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({
    summary: 'Add a legal service to a branch',
    description: 'Branch staff (or org admin) can add a legal package or service. Requires branch access.',
  })
  @ApiParam({ name: 'branchId' })
  @ApiBody({ type: CreateBranchLegalServiceDto })
  async create(
    @Param('branchId') branchId: string,
    @Body() dto: CreateBranchLegalServiceDto,
    @Req() req: RequestWithUser,
  ) {
    return this.legalService.create(branchId, dto, req.user);
  }

  @Patch(':branchId/legal-services/:id')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Update a legal service' })
  @ApiParam({ name: 'branchId' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateBranchLegalServiceDto })
  async update(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchLegalServiceDto,
    @Req() req: RequestWithUser,
  ) {
    return this.legalService.update(id, branchId, dto, req.user);
  }

  @Delete(':branchId/legal-services/:id')
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Delete a legal service' })
  @ApiParam({ name: 'branchId' })
  @ApiParam({ name: 'id' })
  async remove(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.legalService.remove(id, branchId, req.user);
    return { message: 'Legal service deleted' };
  }
}
