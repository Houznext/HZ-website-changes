import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { InfraBranchService } from './infra-branch.service';
import {
  AssignInfraUserToBranchDto,
  CreateInfraBranchDto,
  UpdateInfraBranchDto,
  UpdateInfraBranchMembershipRolesDto,
} from './dto/infra-branch.dto';

@ApiTags('infra-branches')
@Controller('infra-branches')
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
export class InfraBranchController {
  constructor(private readonly branches: InfraBranchService) {}

  @Get('tree')
  getTree() {
    return this.branches.getTree();
  }

  @Get('hierarchy')
  getHierarchy() {
    return this.branches.getHierarchy();
  }

  @Post('assign-user')
  assignUser(@Body() dto: AssignInfraUserToBranchDto) {
    return this.branches.assignUser(dto);
  }

  @Post()
  create(@Body() dto: CreateInfraBranchDto, @Req() req: { user: JwtPayload }) {
    return this.branches.create(dto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.branches.findAll();
  }

  @Get(':id/users')
  usersInBranch(@Param('id') id: string) {
    return this.branches.listUsersInBranch(id);
  }

  @Patch(':id/users/:userId')
  patchUserRoles(
    @Param('id') branchId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateInfraBranchMembershipRolesDto,
  ) {
    return this.branches.updateUserRolesInBranch(branchId, userId, dto);
  }

  @Delete(':id/users/:userId')
  removeUser(@Param('id') branchId: string, @Param('userId') userId: string) {
    return this.branches.removeUserFromBranch(branchId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branches.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInfraBranchDto) {
    return this.branches.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branches.remove(id);
  }
}
