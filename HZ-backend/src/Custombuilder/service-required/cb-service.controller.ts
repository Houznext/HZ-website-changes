import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CBServiceService } from './cb-service.service';
import { CreateCBServiceDto, UpdateCBServiceDto } from './dto/cb-service.dto';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('cb-service')
@Controller('cb-service')
export class CBServiceController {
  constructor(private readonly cbServiceService: CBServiceService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a new CB Service' })
  @ApiBody({ type: CreateCBServiceDto })
  @ApiResponse({
    status: 201,
    description: 'The CB Service has been successfully created.',
  })
  async create(
    @Body() createCBServiceDto: CreateCBServiceDto,
    @Param('customBuilderId') customBuilderId: string,
  ) {
    return await this.cbServiceService.create(
      customBuilderId,
      createCBServiceDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all CB Services' })
  @ApiResponse({
    status: 200,
    description: 'The CB Services have been successfully retrieved.',
  })
  async findAll() {
    return await this.cbServiceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a CB Service by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the CB Service to retrieve' })
  @ApiResponse({
    status: 200,
    description: 'The CB Service has been successfully retrieved.',
  })
  async findById(@Param('id') id: string) {
    return await this.cbServiceService.findById(id);
  }

  @Get('custom-builder/:customBuilderId')
  @ApiOperation({ summary: 'Retrieve a CB Service by Custom Builder ID' })
  @ApiParam({
    name: 'customBuilderId',
    description: 'The ID of the Custom Builder to retrieve the CB Service for',
  })
  @ApiResponse({
    status: 200,
    description: 'The CB Service has been successfully retrieved.',
  })
  async findByCustomBuilderId(
    @Param('customBuilderId') customBuilderId: string,
  ) {
    return await this.cbServiceService.findByCustomBuilderId(customBuilderId);
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing CB Service' })
  @ApiParam({ name: 'id', description: 'The ID of the CB Service to update' })
  @ApiBody({ type: UpdateCBServiceDto })
  @ApiResponse({
    status: 200,
    description: 'The CB Service has been successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCBServiceDto: UpdateCBServiceDto,
  ) {
    return await this.cbServiceService.update(id, updateCBServiceDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CB Service' })
  @ApiParam({ name: 'id', description: 'The ID of the CB Service to delete' })
  @ApiResponse({
    status: 200,
    description: 'The CB Service has been successfully deleted.',
  })
  async delete(@Param('id') id: string) {
    return await this.cbServiceService.delete(id);
  }
  @Get(':customBuilderId/selected-services')
  @ApiOperation({ summary: 'Get selected services by Custom Builder ID' })
  @ApiParam({
    name: 'customBuilderId',
    description: 'ID of the Custom Builder',
  })
  @ApiResponse({
    status: 200,
    description: 'Selected services retrieved successfully.',
  })
  async getSelectedServices(@Param('customBuilderId') customBuilderId: string) {
    return await this.cbServiceService.getSelectedServicesByCustomBuilderId(
      customBuilderId,
    );
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch(':customBuilderId/update-estimates')
  @ApiOperation({
    summary: 'Update estimated days and cost per selected service',
  })
  async updateServiceEstimates(
    @Param('customBuilderId') customBuilderId: string,
    @Body()
    estimates: Record<
      string,
      { estimatedDays: number; estimatedCost?: number }
    >,
  ) {
    return this.cbServiceService.updateServiceEstimates(
      customBuilderId,
      estimates,
    );
  }
}
