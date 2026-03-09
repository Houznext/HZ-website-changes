import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { CityService } from './city.service';
import {
  CreateCityDto,
  ListCitiesQueryDto,
  UpdateCityDto,
} from './dto/city.dto';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly svc: CityService) {}

//   @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new city' })
  create(@Body() dto: CreateCityDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List cities (optional filters)' })
  list(@Query() q: ListCitiesQueryDto) {
    return this.svc.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get city by ID' })
  one(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a city by ID' })
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCityDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a city by ID' })
  del(@Param('id', ParseIntPipe) id: number) {
    return this.svc.delete(id);
  }
}
