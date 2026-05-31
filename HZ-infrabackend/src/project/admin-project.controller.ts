import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto, MilestoneDto, UpdateProjectDto } from './dto/project.dto';

@ApiTags('admin-projects')
@Controller('admin/projects')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.projects.adminList(q);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.projects.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Post(':id/milestones')
  milestones(@Param('id') id: string, @Body() body: { milestones: MilestoneDto[] }) {
    return this.projects.addMilestones(id, body.milestones ?? []);
  }
}
