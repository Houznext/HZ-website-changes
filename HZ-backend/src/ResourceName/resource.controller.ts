import { Controller, Get } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('resources')
@ApiTags('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  getAllResources() {
    return {
      resources: this.resourceService.getAllEntityNames(),
    };
  }
}
