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
import { InfraUserService } from './infra-user.service';
import { CreateInfraUserDto } from '../auth/dto/auth.dto';
import { InfraUserListQueryDto, UpdateInfraUserDto } from './dto/infra-user.dto';

@ApiTags('infra-users')
@Controller('infra-users')
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
export class InfraUserController {
  constructor(private readonly users: InfraUserService) {}

  @Post()
  create(@Body() dto: CreateInfraUserDto) {
    return this.users.create(dto);
  }

  @Get('by-branch/:branchId')
  getUsersByBranch(@Param('branchId') branchId: string) {
    return this.users.getUsersByBranch(branchId);
  }

  @Get()
  findAll(@Query() query: InfraUserListQueryDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInfraUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}
