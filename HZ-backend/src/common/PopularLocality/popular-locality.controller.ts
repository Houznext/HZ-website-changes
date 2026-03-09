import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
  import { PopularLocalityService } from './popular-locality.service';
  import {
    CreatePopularLocalityDto,
    UpdatePopularLocalityDto,
  } from './dto/popular-locality.dto';
  
  @ApiTags('Popular Localities')
  @Controller('popular-localities')
  export class PopularLocalityController {
    constructor(private readonly popularLocalityService: PopularLocalityService) {}
  
    @Post()
    @ApiOperation({ summary: 'Add a new popular locality' })
    @ApiResponse({ status: 201, description: 'Locality created successfully' })
   async create(@Body() dto: CreatePopularLocalityDto) {
      return  await this.popularLocalityService.create(dto);
    }
  
    @Get()
    @ApiOperation({ summary: 'List all popular localities' })
    @ApiResponse({ status: 200, description: 'List of popular localities' })
   async findAll(@Query('city') city?: string) {
      return await this.popularLocalityService.findAll(city);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get popular locality by ID' })
    @ApiResponse({ status: 200, description: 'Single popular locality' })
   async findOne(@Param('id', ParseIntPipe) id: number) {
      return await this.popularLocalityService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a popular locality' })
    @ApiResponse({ status: 200, description: 'Locality updated' })
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdatePopularLocalityDto,
    ) {
      return this.popularLocalityService.update(id, dto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a popular locality' })
    @ApiResponse({ status: 200, description: 'Locality deleted' })
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.popularLocalityService.remove(id);
    }
  }
  