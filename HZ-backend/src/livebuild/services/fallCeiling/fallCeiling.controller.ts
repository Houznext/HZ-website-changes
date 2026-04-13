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
import { FallCeilingService } from './fallCeiling.service';
import {
  CreateFallCeilingDto,
  UpdateFallCeilingDto,
} from './dto/fallCeiling.dto';
import { FallCeiling } from './entities/fallCeiling.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Fall Ceiling')
@Controller('fall-ceiling')
export class FallCeilingController {
  constructor(private readonly fallCeilingService: FallCeilingService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a fall ceiling service' })
  @ApiResponse({
    status: 201,
    description: 'Fall ceiling service created successfully.',
    type: FallCeiling,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({
    status: 400,
    description: 'Fall ceiling service already exists.',
  })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createFallCeilingDto: CreateFallCeilingDto,
  ): Promise<FallCeiling> {
    return this.fallCeilingService.create(
      customBuilderId,
      createFallCeilingDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all fall ceiling services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all fall ceiling services.',
    type: [FallCeiling],
  })
  async findAll(): Promise<FallCeiling[]> {
    return this.fallCeilingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a fall ceiling service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the fall ceiling service.',
    type: FallCeiling,
  })
  @ApiResponse({ status: 404, description: 'Fall ceiling service not found.' })
  async findById(@Param('id') id: string): Promise<FallCeiling> {
    return this.fallCeilingService.findById(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a fall ceiling service' })
  @ApiResponse({
    status: 200,
    description: 'Fall ceiling service updated successfully.',
    type: FallCeiling,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or fall ceiling service not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateFallCeilingDto: UpdateFallCeilingDto,
  ): Promise<FallCeiling> {
    return this.fallCeilingService.update(
      customBuilderId,
      updateFallCeilingDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a fall ceiling service' })
  @ApiResponse({
    status: 200,
    description: 'Fall ceiling service deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or fall ceiling service not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId:  string,
  ): Promise<void> {
    return this.fallCeilingService.delete(customBuilderId);
  }
}
