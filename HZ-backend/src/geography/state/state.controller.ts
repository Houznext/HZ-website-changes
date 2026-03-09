import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { StateService } from './state.service';

@ApiTags('States')
@Controller('states')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  //   @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new state' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateStateDto) {
    return this.stateService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all states' })
  findAll() {
    return this.stateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get state by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.stateService.findById(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a state by ID' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStateDto) {
    return this.stateService.update(id, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a state by ID' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.stateService.delete(id);
  }
}
