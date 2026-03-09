import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BuilderLeadsService } from './builder.service';
import { CreateBuilderLeadDto } from './dtos/builderleads.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuilderLeads } from './Entity/builderlead.entity';
import { ControllerAuthGuard } from 'src/guard';

@Controller('builder-leads')
@ApiTags('BuilderLeads')
export class BuilderLeadsController {
  constructor(private readonly builderLeadsService: BuilderLeadsService) {}

  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'property created.',
    type: BuilderLeads,
  })
  async createBuilderLeads(@Body() createBuilderLeadDto: CreateBuilderLeadDto) {
    return this.builderLeadsService.createBuilderLeads(createBuilderLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all builder leads' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all builder leads.',
    type: [BuilderLeads],
  })
  async findAllBuilderLeads(): Promise<BuilderLeads[]> {
    return this.builderLeadsService.findAllBuilderLeads();
  }
}
