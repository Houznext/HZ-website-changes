import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryService } from './query.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateQueryDto,
  QueryResponseDto,
  UpdateQueryDto,
} from './dto/query.dto';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Queries')
@Controller('queries')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post(':userId')
  @ApiOperation({ summary: 'Create a new user query' })
  @ApiResponse({ status: 201, description: 'Query created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createQuery(
    @Param('userId') userId: string,
    @Body() dto: CreateQueryDto,
  ): Promise<QueryResponseDto> {
    return this.queryService.create(userId, dto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all queries raised by the current user' })
  @ApiResponse({ status: 200, description: 'List of user queries.' })
  async getUserQueries(@Param('userId') userId: string) {
    return this.queryService.findAllByUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Admin: Get all queries' })
  @ApiResponse({ status: 200, description: 'List of all queries.' })
  async getAllQueries() {
    return this.queryService.findAll();
  }

  @Get('custom-builder/:customBuilderId')
  @ApiOperation({ summary: 'Get all queries for a specific custom builder' })
  @ApiResponse({
    status: 200,
    description: 'List of queries for a custom builder.',
  })
  async getByCustomBuilderId(
    @Param('customBuilderId') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.queryService.findAllByCustomBuilder(id, startDate, endDate);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update a query status or reply' })
  @ApiResponse({ status: 200, description: 'Query updated successfully.' })
  @ApiResponse({ status: 404, description: 'Query not found.' })
  async updateQuery(@Param('id') id: string, @Body() dto: UpdateQueryDto) {
    return this.queryService.update(id, dto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a query by ID' })
  @ApiResponse({ status: 200, description: 'Query deleted successfully.' })
  async deleteQuery(@Param('id') id: string) {
    return this.queryService.remove(id);
  }
}
