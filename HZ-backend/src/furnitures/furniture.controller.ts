import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FurnitureService } from './furniture.service';
import {
  CreateFurnitureDto,
  FilterFurnitureDto,
  ReturnFurnitureDto,
  UpdateFurnitureDto,
  AnySubCategory,
  ALL_SUBCATEGORY_VALUES,
} from './dto/furniture.dto';
import { Category, PriceRange, SortOption } from './enum/furniture.enum';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

@ApiTags('Furniture')
@Controller('furniture')
export class FurnitureController {
  constructor(private readonly furnitureService: FurnitureService) {}

  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create furniture product with variants & images' })
  @ApiResponse({ status: 201, type: ReturnFurnitureDto })
  async createFurniture(
    @Req() req: { user: RequestUser },
    @Body() dto: CreateFurnitureDto,
  ): Promise<ReturnFurnitureDto> {
    // here you can enforce: if user.kind === 'SELLER' then dto.sellerId = user.id etc.
    const currentUserId = req.user?.id;
    return this.furnitureService.createFurniture(dto, currentUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all furniture products (with filters)' })
  @ApiQuery({ name: 'category', required: false, enum: Category })
  @ApiQuery({
    name: 'subCategory',
    required: false,
    enum: ALL_SUBCATEGORY_VALUES,
  })
  @ApiQuery({ name: 'priceRange', required: false, enum: PriceRange })
  @ApiQuery({ name: 'sort', required: false, enum: SortOption })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'material', required: false, type: String })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filter: FilterFurnitureDto,
  ): Promise<{
    data: ReturnFurnitureDto[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return this.furnitureService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get furniture product detail by id' })
  @ApiResponse({ status: 200, type: ReturnFurnitureDto })
  async findOne(
    @Param('id') id: string,
  ): Promise<ReturnFurnitureDto> {
    return this.furnitureService.findOne(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update furniture product' })
  @ApiResponse({ status: 200, type: ReturnFurnitureDto })
  async update(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
    @Body() dto: UpdateFurnitureDto,
  ): Promise<ReturnFurnitureDto> {
    const currentUserId = req.user?.id;
    return this.furnitureService.update(id, dto, currentUserId);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete furniture product' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.furnitureService.remove(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed 24 furniture products' })
  @ApiResponse({ status: 201, description: 'Furniture seeded successfully.' })
  async seedFurniture(
    @Req() req: { user: RequestUser },
  ): Promise<{ created: number; failed: number }> {
    return this.furnitureService.seedFurniture(req.user?.id, req.user?.activeBranchId);
  }
}
