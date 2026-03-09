/*************  ✨ Windsurf Command 🌟  *************/
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
import { BranchRoleService } from './branch-role.service';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateBranchRoleDto,
  UpdateBranchRoleDto,
  UpsertPermissionsDto,
} from './dtos/branch-role.dto';
import { BranchRole } from './entities/branch-role.entity';

@Controller('branch-roles')
@ApiTags('branch-roles')
export class BranchRoleController {
  constructor(private readonly service: BranchRoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch role' })
  @ApiResponse({
    status: 201,
    description: 'The branch role has been successfully created.',
  })
  create(@Body() dto: CreateBranchRoleDto): Promise<BranchRole> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Get all branch roles' })
  @ApiResponse({
    status: 200,
    description: 'The branch roles have been successfully retrieved.',
  })
  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.service.findAll(branchId ? branchId : undefined);   
  }

  @ApiOperation({ summary: 'Get a single branch role by id' })
  @ApiResponse({
    status: 200,
    description: 'The branch role has been successfully retrieved.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update a branch role' })
  @ApiResponse({
    status: 200,
    description: 'The branch role has been successfully updated.',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchRoleDto,
  ) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Upsert permissions for a branch role' })
  @ApiResponse({
    status: 200,
    description: 'The permissions have been successfully upserted.',
  })
  @Patch(':id/permissions')
  upsertPermissions(
    @Param('id') id: string,
    @Body() dto: UpsertPermissionsDto,
  ) {
    return this.service.upsertPermissions(id, dto);
  }

  @ApiOperation({ summary: 'Delete a permission for a branch role' })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully deleted.',
  })
  @Delete(':id/permissions/:resource')
  deletePermission(
    @Param('id') id: string,
    @Param('resource') resource: string,
  ) {
    return this.service.deletePermission(id, resource);
  }

  @ApiOperation({ summary: 'Delete a branch role' })
  @ApiResponse({
    status: 200,
    description: 'The branch role has been successfully deleted.',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
