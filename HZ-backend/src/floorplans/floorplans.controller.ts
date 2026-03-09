import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FloorplansService } from './floorplans.service';
import { CreateFloorplanDto, UpdateFloorplanDto } from './dto/floorplan.dto';
import { Floorplan } from './entities/floorplan.entity';

@ApiTags('Floorplans')
@Controller('floorplans')
export class FloorplansController {
  constructor(private readonly floorplansService: FloorplansService) {}

  @Post()
  @ApiOperation({ summary: 'Store floorplan SVG payload' })
  @ApiResponse({ status: 201, type: Floorplan })
  create(@Body() dto: CreateFloorplanDto) {
    return this.floorplansService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List stored floorplans' })
  @ApiResponse({ status: 200, type: [Floorplan] })
  findAll() {
    return this.floorplansService.findAll();
  }

  @Get('plan/:planId')
  @ApiOperation({ summary: 'Get floorplans by external planId' })
  @ApiResponse({ status: 200, type: [Floorplan] })
  findByPlanId(@Param('planId') planId: string) {
    return this.floorplansService.findByPlanId(planId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get floorplan by id' })
  @ApiResponse({ status: 200, type: Floorplan })
  findOne(@Param('id') id: string) {
    return this.floorplansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stored floorplan SVG payload' })
  @ApiResponse({ status: 200, type: Floorplan })
  update(@Param('id') id: string, @Body() dto: UpdateFloorplanDto) {
    return this.floorplansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stored floorplan' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.floorplansService.remove(id);
  }
}
