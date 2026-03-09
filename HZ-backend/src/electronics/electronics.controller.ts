import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ControllerAuthGuard, RequestUser } from 'src/guard';
import {
  CreateElectronicsDto,
  ReturnElectronicsDto,
  UpdateElectronicsDto,
} from './dto/electronics.dto';
import { ElectronicsService } from './electronics.service';
import { Electronics } from './entities/electronics.entity';
import { SortOption } from './enum/electronics.enum';

@ApiTags('Electronics')
@Controller('electronics')
export class ElectronicsController {
  constructor(private readonly electronicService: ElectronicsService) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create an Electronic Product' })
  @ApiResponse({ status: 201, type: CreateElectronicsDto })
  async createElectronics(
    @Body() createElectronicsDto: CreateElectronicsDto,
  ): Promise<Electronics> {
    return await this.electronicService.createElectronics(createElectronicsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Electronic Products' })
  @ApiQuery({
    name: 'categories',
    required: false,
    isArray: true,
    example: ['Kitchen Appliances'],
  })
  @ApiQuery({ name: 'sort', required: false, enum: SortOption })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'discount', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'brand',
    required: false,
    isArray: true,
    example: ['Samsung', 'LG'],
  })
  @ApiQuery({
    name: 'installationRequired',
    required: false,
    type: Boolean,
    example: false,
  })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('categories') categories?: string | string[],
    @Query('sort') sort?: SortOption,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('discount') discount?: number,
    @Query('brand') brand?: string | string[],
    @Query('installationRequired') installationRequired?: boolean,
    @Query('isPublished') isPublished?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('limit') limit?: number,
    @Query('branchId') branchId?: string,
  ): Promise<{
    data: ReturnElectronicsDto[];
    total: number;
    currentPage: number;
    totalPages: number;
    allCategories: string[];
    allColors: string[];
    maximumPrice: number;
  }> {
    // Parse categories if provided as comma separated string
    let parsedCategories: string[] | undefined;
    if (categories) {
      if (typeof categories === 'string') {
        parsedCategories = categories.split(',');
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else {
        throw new HttpException(
          'Invalid categories format',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Parse brand filter
    let parsedBrand: string[] | undefined;
    if (brand) {
      if (typeof brand === 'string') {
        parsedBrand = brand.split(',');
      } else if (Array.isArray(brand)) {
        parsedBrand = brand;
      } else {
        throw new HttpException('Invalid brand format', HttpStatus.BAD_REQUEST);
      }
    }

    // Convert boolean query parameters (if provided as strings)
    const parsedInstallationRequired =
      typeof installationRequired === 'string'
        ? installationRequired === 'true'
        : installationRequired;

    const parsedIsPublished =
      typeof isPublished === 'string' ? isPublished === 'true' : isPublished;
    const parsedIsFeatured =
      typeof isFeatured === 'string' ? isFeatured === 'true' : isFeatured;

    return await this.electronicService.findAll(
      parsedCategories,
      sort,
      minPrice,
      maxPrice,
      search,
      discount,
      page,
      parsedBrand,
      parsedInstallationRequired,
      parsedIsPublished,
      parsedIsFeatured,
      limit,
      branchId,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an Electronic Item' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the electronic item to update',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated Electronic item',
    type: Electronics,
  })
  async update(
    @Param('id') id: string,
    @Body() updateElectronicsDto: UpdateElectronicsDto,
  ): Promise<Electronics> {
    return this.electronicService.update(id, updateElectronicsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an Electronic Item by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the Electronic item to retrieve',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The requested Electronic item',
    type: Electronics,
  })
  async findOne(@Param('id') id: string): Promise<Electronics> {
    return await this.electronicService.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove an Electronic Item by ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the Electronic item to delete',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'The Electronic item has been successfully deleted',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.electronicService.remove(id);
  }

  @UseGuards(ControllerAuthGuard)
  @Post('seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed 8 electronics products' })
  @ApiResponse({ status: 201, description: 'Electronics seeded successfully.' })
  async seedElectronics(
    @Req() req: { user: RequestUser },
  ): Promise<{ created: number; failed: number }> {
    return this.electronicService.seedElectronics(req.user?.id, req.user?.activeBranchId);
  }
}
