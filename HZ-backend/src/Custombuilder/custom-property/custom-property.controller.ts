import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import {
  CreateCBPropertyDto,
  UpdateCBPropertyDto,
  UpdateFloorsDto,
} from './dto/cb-property.dto';
import { CBProperty } from './entities/cb-property.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CBPropertyService } from './custom-property.service';
import { CreateFloorDto } from '../floor/dto/floor.dto';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Custom Property')
@Controller('custom-property')
export class CBPropertyController {
  constructor(private readonly cbPropertyService: CBPropertyService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post(':id')
  @ApiOperation({
    summary: 'Create a new custom property with a custom builder id',
  })
  @ApiResponse({
    status: 201,
    description: 'The custom property has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Body() createCBPropertyDto: CreateCBPropertyDto,
    @Param('id') customBuilderId: string,
  ): Promise<CBProperty> {
    return this.cbPropertyService.create(customBuilderId, createCBPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all custom properties' })
  @ApiResponse({
    status: 200,
    description: 'The custom properties have been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(): Promise<CBProperty[]> {
    return this.cbPropertyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a custom property by ID' })
  @ApiResponse({
    status: 200,
    description: 'The custom property has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string): Promise<CBProperty> {
    return this.cbPropertyService.findOne(id);
  }

  @Get('custom-builder/:customBuilderId')
  @ApiOperation({ summary: 'Get a custom property by custom builder ID' })
  @ApiResponse({
    status: 200,
    description: 'The custom property has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOneByCustomBuilderId(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<CBProperty> {
    return this.cbPropertyService.findOneByCustomBuilderId(customBuilderId);
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a custom property' })
  @ApiResponse({
    status: 200,
    description: 'The custom property has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
      @Param('id') id: string,
    @Body() updateCBPropertyDto: UpdateCBPropertyDto,
  ): Promise<CBProperty> {
    return this.cbPropertyService.update(id, updateCBPropertyDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom property' })
  @ApiResponse({
    status: 200,
    description: 'The custom property has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.cbPropertyService.remove(id);
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch(':customBuilderId/floors')
  @ApiOperation({ summary: 'Update floors for a custom property' })
  @ApiResponse({
    status: 200,
    description: 'The floors have been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiBody({ type: UpdateFloorsDto })
  async updateFloors(
    @Param('customBuilderId') customBuilderId: string,
    @Body() floorsData: UpdateFloorsDto,
  ): Promise<CBProperty> {
    return this.cbPropertyService.updateFloors(customBuilderId, floorsData);
  }
}
