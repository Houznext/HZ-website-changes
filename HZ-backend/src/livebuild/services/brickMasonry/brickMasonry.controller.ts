import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BrickMasonryService } from './brickMasonry.service';
import {
  CreateBrickMasonryDto,
  UpdateBrickMasonryDto,
} from './dto/brickMasonry.dto';
import { BrickMasonry } from './entities/brickMasonry.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Brick Masonry')
@Controller('brick-masonry')
export class BrickMasonryController {
  constructor(private readonly brickMasonryService: BrickMasonryService) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create brick masonry' })
  @ApiBody({ type: CreateBrickMasonryDto })
  @ApiResponse({
    status: 201,
    description: 'Brick masonry successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Service not found.' })
  create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createBrickMasonryDto: CreateBrickMasonryDto,
  ): Promise<BrickMasonry> {
    return this.brickMasonryService.create(
      customBuilderId,
      createBrickMasonryDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all brick masonries' })
  @ApiResponse({ status: 200, description: 'List of all brick masonries.' })
  findAll(): Promise<BrickMasonry[]> {
    return this.brickMasonryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brick masonry by ID' })
  @ApiResponse({ status: 200, description: 'Brick masonry found.' })
  @ApiResponse({ status: 404, description: 'Brick masonry not found.' })
  findById(@Param('id') id: string): Promise<BrickMasonry> {
    return this.brickMasonryService.findById(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':customBuilderId')
  @ApiOperation({ summary: 'Update brick masonry' })
  @ApiBody({ type: UpdateBrickMasonryDto })
  @ApiResponse({
    status: 200,
    description: 'Brick masonry successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Service or brick masonry not found.',
  })
  update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateBrickMasonryDto: UpdateBrickMasonryDto,
  ): Promise<BrickMasonry> {
    return this.brickMasonryService.update(
      customBuilderId,
      updateBrickMasonryDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete brick masonry' })
  @ApiResponse({
    status: 200,
    description: 'Brick masonry successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Service or brick masonry not found.',
  })
  delete(@Param('customBuilderId') customBuilderId: string): Promise<void> {
    return this.brickMasonryService.delete(customBuilderId);
  }
}
