import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlumbingService } from './plumbing.service';
import { CreatePlumbingDto, UpdatePlumbingDto } from './dto/plumbing.dto';
import { Plumbing } from './entities/plumbing.entity';
 import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Plumbing')
@Controller('plumbing')
export class PlumbingController {
  constructor(private readonly plumbingService: PlumbingService) {}
  //  @UseGuards(ControllerAuthGuard)

  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a plumbing service' })
  @ApiResponse({
    status: 201,
    description: 'Plumbing service created successfully.',
    type: Plumbing,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({ status: 400, description: 'Plumbing service already exists.' })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createPlumbingDto: CreatePlumbingDto,
  ): Promise<Plumbing> {
    return this.plumbingService.create(customBuilderId, createPlumbingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plumbing services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all plumbing services.',
    type: [Plumbing],
  })
  async findAll(): Promise<Plumbing[]> {
    return this.plumbingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plumbing service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the plumbing service.',
    type: Plumbing,
  })
  @ApiResponse({ status: 404, description: 'Plumbing service not found.' })
  async findById(@Param('id') id: string): Promise<Plumbing> {
    return this.plumbingService.findById(id);
  }

  //  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a plumbing service' })
  @ApiResponse({
    status: 200,
    description: 'Plumbing service updated successfully.',
    type: Plumbing,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or plumbing service not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updatePlumbingDto: UpdatePlumbingDto,
  ): Promise<Plumbing> {
    return this.plumbingService.update(customBuilderId, updatePlumbingDto);
  }
 @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a plumbing service' })
  @ApiResponse({
    status: 200,
    description: 'Plumbing service deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or plumbing service not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.plumbingService.delete(customBuilderId);
  }
}
