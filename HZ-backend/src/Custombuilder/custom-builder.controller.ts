import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomBuilderService } from './custom-builder.service';
import {
  CreateCustomBuilderDto,
  UpdateCustomBuilderDto,
} from './dto/custom-builder.dto';
import { ControllerAuthGuard, RequestUser } from 'src/guard';

type RequestWithUser = { user: RequestUser };

@ApiTags('custom-builder')
@Controller('custom-builder')
@UseGuards(ControllerAuthGuard)
export class CustomBuilderController {
  constructor(private readonly customBuilderService: CustomBuilderService) {}

 
  @Post(':customerId')
  @ApiOperation({ summary: 'Create a custom builder (scoped to branch)' })
  @ApiResponse({
    status: 201,
    description: 'The custom builder has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Req() req: RequestWithUser,
    @Param('customerId') customerId: string,
    @Body() createCustomBuilderDto: CreateCustomBuilderDto,
  ) {
   
    return this.customBuilderService.create(
      req.user,
      customerId,
      createCustomBuilderDto,
    );
  }

  
  @Get('/all')
  @ApiOperation({
    summary:
      'Get all custom builders (SuperAdmin + BranchHead = all, others only their own)',
  })
  @ApiResponse({
    status: 200,
    description: 'The custom builders have been successfully retrieved.',
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('userId') _userId?: number, 
  ): Promise<any[]> {
    return this.customBuilderService.findAllByUser(req.user);
  }

 
  @Get(':id')
  @ApiOperation({ summary: 'Get a custom builder by id' })
  @ApiResponse({
    status: 200,
    description: 'The custom builder has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Custom builder not found.' })
  async findOne(@Param('id') id: string) {
    return this.customBuilderService.findById(id);
  }

  
  @Get(':id/logs')
  @ApiOperation({ summary: 'Get a custom builder by id with paginated logs' })
  async findOneWithLogs(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.customBuilderService.findByIdWithLogs(id, page, limit);
  }

  
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get custom builders by customer (user) id' })
  @ApiResponse({
    status: 200,
    description: 'The custom builders have been successfully retrieved.',
  })
  async findByUserAdminId(@Param('userId') userId: string) {
    return this.customBuilderService.findByUserAdminId(userId);
  }

  @Get('user/minimal/:userId')
  @ApiOperation({ summary: 'Get minimal CBs by customer (user) id' })
  @ApiResponse({
    status: 200,
    description: 'The custom builders have been successfully retrieved.',
  })
  async findMinimalByUserId(@Param('userId') userId: string) {
    return this.customBuilderService.findMinimalByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a custom builder' })
  @ApiResponse({
    status: 200,
    description: 'The custom builder has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomBuilderDto: UpdateCustomBuilderDto,
  ) {
    return this.customBuilderService.update(id, updateCustomBuilderDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a custom builder' })
  @ApiResponse({
    status: 200,
    description: 'The custom builder has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Custom builder not found.' })
  async remove(@Param('id') id: string) {
    return this.customBuilderService.deleteById(id);
  }
}
