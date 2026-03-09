// src/hr/hr.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HrService } from './hr.service';
import {
  CreateHrDetailsDto,
  ListHrDetailsQueryDto,
  UpdateHrDetailsDto,
} from './dto/employee-hr.dto';

import { ControllerAuthGuard,RequestUser  } from 'src/guard';

import { User } from 'src/user/entities/user.entity';


type RequestWithUser = { user: RequestUser };

@ApiTags('hr')
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

 
  @UseGuards(ControllerAuthGuard) 
  @Patch('me')
  @ApiOperation({
    summary: 'Create/Update HR details for current user (partial update)',
  })
  async upsertMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateHrDetailsDto,
  ) {
    const userId = req.user.id;
    return this.hrService.upsertForUser(userId, dto, {
      allowBranchChange: false,
    });
  }

  @UseGuards(ControllerAuthGuard) 
  @Get('me')
  @ApiOperation({ summary: 'Get HR details for current user' })
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.hrService.findByUserId(userId);
  }

  

  @UseGuards(ControllerAuthGuard) 
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get HR details for a specific user' })
  async getForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.hrService.findByUserId(userId);

  }

  @UseGuards(ControllerAuthGuard) 
  @Patch('user/:userId')
  @ApiOperation({
    summary: 'Upsert HR details for a specific user (partial update)',
  })
  async upsertForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateHrDetailsDto,
  ) {
    return this.hrService.upsertForUser(userId, dto, {
      allowBranchChange: true,
    });
    
  }

  @UseGuards(ControllerAuthGuard) 
  @Get()
  @ApiOperation({
    summary:
      'List HR details for employees (filter by branchId, employmentType, search)',
  })
  async list(@Query() query: ListHrDetailsQueryDto) {
    return this.hrService.findAll(query);
  }

  @UseGuards(ControllerAuthGuard) 
  @Get('branch/:branchId')
  @ApiOperation({ summary: 'List HR details for a specific branch' })
  async listByBranch(@Param('branchId', ParseIntPipe) branchId: string) {
    return this.hrService.findAll({ branchId });
  }
}
