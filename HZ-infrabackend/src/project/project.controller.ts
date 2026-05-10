import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Get()
  list(@Query('featured') featured?: string, @Query('limit') limit?: string) {
    const isFeatured = featured === 'true';
    const lim = limit ? Number(limit) : 20;
    return this.projects.list(isFeatured, lim);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.projects.bySlug(slug);
  }
}
