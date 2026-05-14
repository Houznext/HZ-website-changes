import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { InfraBranchRoleService } from './infra-branch-role.service';
import {
  CreateInfraBranchRoleDto,
  UpdateInfraBranchRoleDto,
  UpsertInfraBranchRolePermissionsDto,
} from './dto/infra-branch-role.dto';

@ApiTags('infra-branch-roles')
@Controller('infra-branch-roles')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidUnknownValues: false,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class InfraBranchRoleController {
  constructor(private readonly roles: InfraBranchRoleService) {}

  @Post()
  create(@Body() dto: CreateInfraBranchRoleDto) {
    return this.roles.create(dto);
  }

  @Get('by-branch/:branchId')
  byBranch(@Param('branchId') branchId: string) {
    return this.roles.findByBranch(branchId);
  }

  @Get()
  findAll(@Query('branchId') branchId?: string) {
    return this.roles.findAll(branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roles.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInfraBranchRoleDto) {
    return this.roles.update(id, dto);
  }

  @Patch(':id/permissions')
  upsertPermissions(@Param('id') id: string, @Body() dto: UpsertInfraBranchRolePermissionsDto) {
    return this.roles.upsertPermissions(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roles.remove(id);
  }
}
