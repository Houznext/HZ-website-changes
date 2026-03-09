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
import { ElectricityService } from './electricity.service';
import {
  CreateElectricityDto,
  UpdateElectricityDto,
} from './dto/electricity.dto';
import { Electricity } from './entities/electricity.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Electricity')
@Controller('electricity')
export class ElectricityController {
  constructor(private readonly electricityService: ElectricityService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create an electricity service' })
  @ApiResponse({
    status: 201,
    description: 'Electricity service created successfully.',
    type: Electricity,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({
    status: 400,
    description: 'Electricity service already exists.',
  })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createElectricityDto: CreateElectricityDto,
  ): Promise<Electricity> {
    return this.electricityService.create(
      customBuilderId,
      createElectricityDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all electricity services' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all electricity services.',
    type: [Electricity],
  })
  async findAll(): Promise<Electricity[]> {
    return this.electricityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an electricity service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the electricity service.',
    type: Electricity,
  })
  @ApiResponse({ status: 404, description: 'Electricity service not found.' })
  async findById(@Param('id') id: string): Promise<Electricity> {
    return this.electricityService.findById(id);
  }
  // @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update an electricity service' })
  @ApiResponse({
    status: 200,
    description: 'Electricity service updated successfully.',
    type: Electricity,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or electricity service not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateElectricityDto: UpdateElectricityDto,
  ): Promise<Electricity> {
    return this.electricityService.update(
      customBuilderId,
      updateElectricityDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete an electricity service' })
  @ApiResponse({
    status: 200,
    description: 'Electricity service deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or electricity service not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.electricityService.delete(customBuilderId);
  }
}
