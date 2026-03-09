import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ControllerAuthGuard, RequestUser } from 'src/guard';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateHomeDecoreDto,
  ReturnHomeDecoreDto,
  UpdateHomeDecorDto,
} from './dto/homeDecor.dto';
import { HomeDecors } from './entities/homeDecors.entity';
import { HomeDecorService } from './homeDecors.service';
import { HomeDecorsCategory, SortOption } from './enum/homeDecors.enum';

@ApiTags('HomeDecors')
@Controller('homeDecor')
export class HomeDecorController {
  constructor(private readonly homeDecorService: HomeDecorService) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create Home Decore' })
  @ApiResponse({ status: 201, type: CreateHomeDecoreDto })
  async createHomeDecor(
    @Body() createHomeDecoreDto: CreateHomeDecoreDto,
  ): Promise<HomeDecors> {
    return await this.homeDecorService.createHomeDecor(createHomeDecoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Home Decors' })
  @ApiQuery({
    name: 'categories',
    required: false,
    isArray: true,
    example: ['Wall Shelves', 'Pots and Plants'],
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Single category (same as categories with one value)',
  })
  @ApiQuery({ name: 'sort', required: false, enum: SortOption })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'discount', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('categories') categories?: string | string[],
    @Query('category') category?: string,
    @Query('sort') sort?: SortOption,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('discount') discount?: number,
    @Query('branchId') branchId?: string,
  ): Promise<{
    data: ReturnHomeDecoreDto[];
    total: number;
    currentPage: number;
    totalPages: number;
    allCategories: string[];
    allColors: string[];
    maximumPrice: number;
  }> {
    let parsedCategories: string[] | undefined;

    if (categories) {
      if (typeof categories === 'string') {
        parsedCategories = categories.split(',').map((c) => c.trim()).filter(Boolean);
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else {
        throw new HttpException(
          'Invalid categories format',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (category && category.trim()) {
      parsedCategories = [category.trim()];
    }

    return await this.homeDecorService.findAll(
      parsedCategories,
      sort,
      minPrice,
      maxPrice,
      search,
      discount,
      page,
      branchId,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a Home Decor Item' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the Home Decor item to update',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated Home Decor item',
    type: HomeDecors,
  })
  async update(
    @Param('id') id: string,
    @Body() updateHomeDecorDto: UpdateHomeDecorDto,
  ): Promise<HomeDecors> {
    return this.homeDecorService.update(id, updateHomeDecorDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a Home Decor Item by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the Home Decor item to retrieve',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The requested Home Decor item',
    type: HomeDecors,
  })
  async findOne(@Param('id') id: string): Promise<HomeDecors> {
    return await this.homeDecorService.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a Home Decor Item by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the Home Decor item to delete',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'The Home Decor item has been successfully deleted',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.homeDecorService.remove(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed 54 home decor products' })
  @ApiResponse({ status: 201, description: 'Home decor seeded successfully.' })
  async seedHomeDecor(
    @Req() req: { user: RequestUser },
  ): Promise<{ created: number; failed: number }> {
    return this.homeDecorService.seedHomeDecor(req.user?.id, req.user?.activeBranchId);
  }
}
