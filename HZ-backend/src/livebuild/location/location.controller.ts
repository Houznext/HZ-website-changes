import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
   UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    return await this.locationService.findAll();
  }
  // @UseGuards(ControllerAuthGuard)

  // @Post(':customBuilderId')
  // @ApiOperation({ summary: 'Create a location' })
  // @ApiResponse({ status: 201, description: 'Location created successfully' })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // async create(
  //   @Body() createLocationDto: CreateLocationDto,
  //   @Param('customBuilderId') customBuilderId: string,
  // ) {
  //   return await this.locationService.create(customBuilderId, createLocationDto);
  // }
  @Post(':userId')
@ApiOperation({ summary: 'Create a location' })
@ApiResponse({ status: 201, description: 'Location created successfully' })
@ApiResponse({ status: 400, description: 'Bad request' })
async create(
  @Body() createLocationDto: CreateLocationDto,
  @Param('userId') userId: string,
) {
  return await this.locationService.create(userId, createLocationDto);
}


  @Get(':id')
  @ApiOperation({ summary: 'Find a location by id' })
  @ApiResponse({ status: 200, description: 'Location found successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(@Param('id') id: string) {
    return await this.locationService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Find locations by user id' })
  @ApiResponse({ status: 200, description: 'Locations found successfully' })
  @ApiResponse({ status: 404, description: 'Locations not found' })
  async findByUserId(@Param('userId') userId: string) {
    return await this.locationService.findByUserId(userId);
  }

  @Get('custombuilder/:customBuilderId')
  @ApiOperation({ summary: 'Find a location by custom builder id' })
  @ApiResponse({ status: 200, description: 'Location found successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findByCustomBuilderId(
    @Param('customBuilderId') customBuilderId: string,
  ) {
    return await this.locationService.findByCustomBuilderId(customBuilderId);
  }
 @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return await this.locationService.update(id, updateLocationDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a location' })
  @ApiResponse({ status: 200, description: 'Location removed successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async remove(@Param('id') id: string) {
    await this.locationService.remove(id);
  }
}
