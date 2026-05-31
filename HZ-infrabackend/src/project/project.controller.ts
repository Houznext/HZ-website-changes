import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConstructionStatus, ProjectType } from '../common/enums/infra.enums';
import { ProjectService } from './project.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Get()
  list(
    @Query('type') type?: string,
    @Query('city') city?: string,
    @Query('status') status?: string,
    @Query('budget') budget?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
  ) {
    const maxPrice = budget ? Number(budget) : undefined;
    return this.projects.list({
      projectType: type as ProjectType | undefined,
      city: city || undefined,
      status: status as ConstructionStatus | undefined,
      maxPrice: maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
      featured: featured === 'true' ? true : undefined,
      limit: limit ? Number(limit) : 20,
      published: true,
      showInSearch: true,
    });
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.projects.bySlug(slug);
  }
}
