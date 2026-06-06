import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InteriorProjectsService } from './interior-projects.service';
import { CreateInteriorProjectDto } from './dto/create-interior-project.dto';
import { UpdateInteriorProjectDto } from './dto/update-interior-project.dto';
import { UpdateDisplayTotalDto } from './dto/update-display-total.dto';
import { ControllerAuthGuard } from '../guard';

@Controller('interior-projects')
export class InteriorProjectsController {
  constructor(private readonly service: InteriorProjectsService) {}

  @Get('public')
  findPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('package') pkg?: string,
    @Query('propertyType') propertyType?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.findPublic({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      package: pkg,
      propertyType,
      sort,
    });
  }

  @Get('public/stats')
  publicStats() {
    return this.service.publicStats();
  }

  @Get('public/:id')
  findPublicOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findPublicOne(id);
  }

  @Get()
  @UseGuards(ControllerAuthGuard)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('package') pkg?: string,
    @Query('propertyType') propertyType?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      package: pkg,
      propertyType,
      search,
      sort,
    });
  }

  @Get('stats')
  @UseGuards(ControllerAuthGuard)
  stats() {
    return this.service.stats();
  }

  @Patch('stats/display-total')
  @UseGuards(ControllerAuthGuard)
  updateDisplayTotal(@Body() dto: UpdateDisplayTotalDto) {
    return this.service.updateDisplayTotal(dto);
  }

  @Get(':id')
  @UseGuards(ControllerAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(ControllerAuthGuard)
  create(@Body() dto: CreateInteriorProjectDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInteriorProjectDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ControllerAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
