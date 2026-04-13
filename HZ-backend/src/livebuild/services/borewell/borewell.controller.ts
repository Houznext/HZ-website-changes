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

import { BorewellService } from './borewell.service';
import { CreateBorewellDto, UpdateBorewellDto } from './dto/borewell.dto';

@ApiTags('borewells')
@Controller('borewells')
export class BorewellController {
  constructor(private readonly borewellService: BorewellService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a Borewell' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'This service already has a borewell.',
  })
  async create(
    @Body() createBorewellDto: CreateBorewellDto,
    @Param('customBuilderId') customBuilderId: string,
  ) {
    try {
      return await this.borewellService.create(
        customBuilderId,
        createBorewellDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find All Borewells' })
  @ApiResponse({
    status: 200,
    description: 'The list of records has been successfully retrieved.',
  })
  async findAll() {
    try {
      return await this.borewellService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find Borewell by ID' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully retrieved.',
  })
  @ApiNotFoundResponse({ description: 'Borewell with ID {id} not found.' })
  async findById(@Param('id') id: string) {
    try {
      return await this.borewellService.findById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update Borewell' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'This service already has a borewell.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateBorewellDto: UpdateBorewellDto,
  ) {
    try {
      return await this.borewellService.update(
        customBuilderId,
        updateBorewellDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete Borewell' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Borewell not found.' })
  async delete(@Param('customBuilderId') customBuilderId: string) {
    try {
      return await this.borewellService.delete(customBuilderId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
