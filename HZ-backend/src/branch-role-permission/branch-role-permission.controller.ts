import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { BranchRolePermissionService } from './branch-role-permission.service';
import {
  CreateBranchRolePermissionDto,
  UpdateBranchRolePermissionDto,
} from './dto/branch-role-permission.dto';
import { BranchRolePermission } from './entities/branch-role.-permission.entity';

@ApiTags('Branch Role Permissions')
@Controller('branch-role-permissions')
export class BranchRolePermissionController {
  constructor(private readonly service: BranchRolePermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a permission row for a branch role (unique resource per role)' })
  @ApiCreatedResponse({ type: BranchRolePermission })
  @ApiBody({ type: CreateBranchRolePermissionDto })
  create(@Body() dto: CreateBranchRolePermissionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List permissions (filter by branchRoleId / resource)' })
  @ApiOkResponse({ type: BranchRolePermission, isArray: true })
  @ApiQuery({ name: 'branchRoleId', required: false, type: Number, description: 'Filter by branch role id' })
  @ApiQuery({ name: 'resource', required: false, type: String, description: 'Filter by resource (ILIKE %...%)' })
  findAll(
    @Query('branchRoleId') branchRoleId?: string,
    @Query('resource') resource?: string,
  ) {
    return this.service.findAll({
      branchRoleId: branchRoleId ? parseInt(branchRoleId, 10) : undefined,
      resource: resource || undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission row by id' })
  @ApiOkResponse({ type: BranchRolePermission })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission row (resource uniqueness per role enforced)' })
  @ApiOkResponse({ type: BranchRolePermission })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateBranchRolePermissionDto })
  update(@Param('id') id: string, @Body() dto: UpdateBranchRolePermissionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission row' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
    },
  })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
