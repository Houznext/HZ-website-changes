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
import { CentringService } from './centring.service';
import { CreateCentringDto, UpdateCentringDto } from './dto/centring.dto';
import { Centring } from './entities/centring.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Centring')
@Controller('centring')
export class CentringController {
  constructor(private readonly centringService: CentringService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a centring' })
  @ApiResponse({
    status: 201,
    description: 'Centring created successfully.',
    type: Centring,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({
    status: 400,
    description: 'Centring already exists for this service.',
  })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createCentringDto: CreateCentringDto,
  ): Promise<Centring> {
    return this.centringService.create(customBuilderId, createCentringDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all centrings' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all centrings.',
    type: [Centring],
  })
  async findAll(): Promise<Centring[]> {
    return this.centringService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a centring by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the centring.',
    type: Centring,
  })
  @ApiResponse({ status: 404, description: 'Centring not found.' })
  async findById(@Param('id') id: string): Promise<Centring> {
    return this.centringService.findById(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a centring' })
  @ApiResponse({
    status: 200,
    description: 'Centring updated successfully.',
    type: Centring,
  })
  @ApiResponse({ status: 404, description: 'CBService or centring not found.' })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateCentringDto: UpdateCentringDto,
  ): Promise<Centring> {
    return this.centringService.update(customBuilderId, updateCentringDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a centring' })
  @ApiResponse({ status: 200, description: 'Centring deleted successfully.' })
  @ApiResponse({ status: 404, description: 'CBService or centring not found.' })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.centringService.delete(customBuilderId);
  }
}
