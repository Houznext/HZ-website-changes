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
import { FlooringService } from './flooring.service';
import { CreateFlooringDto, UpdateFlooringDto } from './dto/flooring.dto';
import { Flooring } from './entities/flooring.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Flooring')
@Controller('flooring')
export class FlooringController {
  constructor(private readonly flooringService: FlooringService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a flooring service' })
  @ApiResponse({
    status: 201,
    description: 'Flooring service created successfully.',
    type: Flooring,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({ status: 400, description: 'Flooring service already exists.' })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createFlooringDto: CreateFlooringDto,
  ): Promise<Flooring> {
    return this.flooringService.create(customBuilderId, createFlooringDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flooring services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all flooring services.',
    type: [Flooring],
  })
  async findAll(): Promise<Flooring[]> {
    return this.flooringService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flooring service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the flooring service.',
    type: Flooring,
  })
  @ApiResponse({ status: 404, description: 'Flooring service not found.' })
  async findById(@Param('id') id: string): Promise<Flooring> {
    return this.flooringService.findById(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a flooring service' })
  @ApiResponse({
    status: 200,
    description: 'Flooring service updated successfully.',
    type: Flooring,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or flooring service not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateFlooringDto: UpdateFlooringDto,
  ): Promise<Flooring> {
    return this.flooringService.update(customBuilderId, updateFlooringDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a flooring service' })
  @ApiResponse({
    status: 200,
    description: 'Flooring service deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or flooring service not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.flooringService.delete(customBuilderId);
  }
}
