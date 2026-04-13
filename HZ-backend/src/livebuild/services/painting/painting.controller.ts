import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaintingService } from './painting.service';
import { CreatePaintingDto, UpdatePaintingDto } from './dto/painting.dto';
import { Painting } from './entities/painting.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Painting')
@Controller('painting')
export class PaintingController {
  constructor(private readonly paintingService: PaintingService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a painting service' })
  @ApiResponse({
    status: 201,
    description: 'Painting service created successfully.',
    type: Painting,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({ status: 400, description: 'Painting service already exists.' })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createPaintingDto: CreatePaintingDto,
  ): Promise<Painting> {
    return this.paintingService.create(customBuilderId, createPaintingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all painting services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all painting services.',
    type: [Painting],
  })
  async findAll(): Promise<Painting[]> {
    return this.paintingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a painting service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the painting service.',
    type: Painting,
  })
  @ApiResponse({ status: 404, description: 'Painting service not found.' })
  async findById(@Param('id') id: string): Promise<Painting> {
    return this.paintingService.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a painting service' })
  @ApiResponse({
    status: 200,
    description: 'Painting service updated successfully.',
    type: Painting,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or painting service not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updatePaintingDto: UpdatePaintingDto,
  ): Promise<Painting> {
    return this.paintingService.update(customBuilderId, updatePaintingDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a painting service' })
  @ApiResponse({
    status: 200,
    description: 'Painting service deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or painting service not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.paintingService.delete(customBuilderId);
  }
}
