import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FurnitureLeadService } from './furniture-lead.service';
import { FurnitureLeads } from './entities/furniture-leads.entity';
import { createFurnitureLeadsDto } from './dtos/furniture-lead.dto';
import { ControllerAuthGuard } from 'src/guard';

@Controller('furniture-leads')
@ApiTags('FurnitureLeads')
export class FurnitureLeadsController {
  constructor(private readonly furnitureLeadsService: FurnitureLeadService) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create new form data' })
  @ApiResponse({ status: 201, description: 'Form data created successfully.' })
  create(
    @Body() createFurnitureLeadsDto: createFurnitureLeadsDto,
  ): Promise<FurnitureLeads> {
    return this.furnitureLeadsService.create(createFurnitureLeadsDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all form data' })
  @ApiResponse({ status: 200, description: 'Retrieved all form data.' })
  async findAll(): Promise<FurnitureLeads[]> {
    return this.furnitureLeadsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form data by ID' })
  @ApiResponse({ status: 200, description: 'Retrieved form data by ID.' })
  async findOne(@Param('id') id: string): Promise<FurnitureLeads> {
    return this.furnitureLeadsService.findOne(+id);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete form data by ID' })
  @ApiResponse({ status: 200, description: 'Form data deleted successfully.' })
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.furnitureLeadsService.remove(+id);
  }
}
