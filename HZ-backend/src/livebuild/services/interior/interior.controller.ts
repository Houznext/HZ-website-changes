import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

import {
  CreateInteriorServiceDto,
  UpdateInteriorServiceDto,
} from './dto/interior.dto';
import { InteriorServiceService } from './interior.service';

@ApiTags('interior-services')
@Controller('interior-services')
export class InteriorServiceController {
  constructor(
    private readonly interiorServiceService: InteriorServiceService,
  ) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create an InteriorService' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'This service already has an interior service.',
  })
  async create(
    @Body() createInteriorServiceDto: CreateInteriorServiceDto,
    @Param('customBuilderId') customBuilderId: string,
  ) {
    try {
      return await this.interiorServiceService.create(
        customBuilderId,
        createInteriorServiceDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find All InteriorServices' })
  @ApiResponse({
    status: 200,
    description: 'The list of records has been successfully retrieved.',
  })
  async findAll() {
    try {
      return await this.interiorServiceService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find InteriorService by ID' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'InteriorService with ID {id} not found.',
  })
  async findById(@Param('id') id: string) {
    try {
      return await this.interiorServiceService.findById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update InteriorService' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request when updating InteriorService.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateInteriorServiceDto: UpdateInteriorServiceDto,
  ) {
    try {
      return await this.interiorServiceService.update(
        customBuilderId,
        updateInteriorServiceDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete InteriorService' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'InteriorService not found.' })
  async delete(@Param('customBuilderId') customBuilderId: string) {
    try {
      return await this.interiorServiceService.delete(customBuilderId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
