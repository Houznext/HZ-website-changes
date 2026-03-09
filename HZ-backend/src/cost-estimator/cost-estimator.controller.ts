import { ApiTags, ApiOperation, ApiResponse, ApiQuery,ApiBearerAuth } from '@nestjs/swagger';
import { CostEstimatorService } from './cost-estimator.service';

import { CostEstimator } from './entities/cost-estimator.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,Req
} from '@nestjs/common';
import {
  CreateCostEstimatorDto,
  UpdateCostEstimatorDto,
} from './dto/cost-estimator.dto';
import { EstimationCategory } from './Enum/cost-estimator.enum';
import { ControllerAuthGuard,RequestUser  } from 'src/guard';

@ApiTags('cost-estimator')


@Controller('cost-estimator')
export class CostEstimatorController {
  constructor(private readonly costEstimatorService: CostEstimatorService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new cost estimator' })
  @ApiResponse({
    status: 201,
    description: 'The cost estimator has been successfully created.',
    type: CostEstimator,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createCostEstimatorDto: CreateCostEstimatorDto,
  ): Promise<CostEstimator> {
    return this.costEstimatorService.create(createCostEstimatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cost estimators' })
  @ApiResponse({
    status: 200,
    description: 'Return all cost estimators.',
    type: [CostEstimator],
  })
  @ApiQuery({ name: 'category', required: false, enum: EstimationCategory })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'firstname', required: false })
  @ApiQuery({ name: 'lastname', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'property_name', required: false })
  @ApiQuery({ name: 'bhk', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'pincode', required: false })
  @ApiQuery({ name: 'landmark', required: false })
  @ApiQuery({ name: 'locality', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
     @Query('branchId') branchId?: number,
    @Query('firstname') firstname?: string,
    @Query('lastname') lastname?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: number,
    @Query('property_name') property_name?: string,
    @Query('bhk') bhk?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('pincode') pincode?: string,
    @Query('landmark') landmark?: string,
    @Query('locality') locality?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: EstimationCategory,
  ) {
    return await this.costEstimatorService.findAll(
       branchId ? Number(branchId) : undefined,
      firstname,
      lastname,
      email,
      phone,
      property_name,
      bhk,
      city,
      state,
      pincode,
      landmark,
      locality,
      (page = 1),
      (limit = 10),
      category,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cost estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the cost estimator.',
    type: CostEstimator,
  })
  @ApiResponse({ status: 404, description: 'Cost estimator not found.' })
  async findById(
    @Param('id') id: string,
     @Query('branchId') branchId?: string, 
  ): Promise<CostEstimator> {
    return this.costEstimatorService.findById(id, branchId);
  }
  // @UseGuards(ControllerAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a cost estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'The cost estimator has been successfully updated.',
    type: CostEstimator,
  })
  @ApiResponse({ status: 404, description: 'Cost estimator not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateCostEstimatorDto: UpdateCostEstimatorDto,
  ): Promise<CostEstimator> {
    return this.costEstimatorService.update(id, updateCostEstimatorDto);
  }
  // @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cost estimator by ID' })
  @ApiResponse({
    status: 200,
    description: 'The cost estimator has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Cost estimator not found.' })
  async delete(@Param('id') id: string,  @Body('userId') userId: string, ): Promise<void> {
   
    return this.costEstimatorService.delete(id,userId);
  }

  @Get('send-email/:email')
  @ApiOperation({ summary: 'Send email to user' })
  @ApiResponse({
    status: 200,
    description: 'The email has been successfully sent.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async sendEmail(@Param('email') email: string): Promise<void> {
    return this.costEstimatorService.sendEmail(email);
  }
  @UseGuards(ControllerAuthGuard)

  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Get cost Estimation for a specific user based on id',
  })
  @ApiResponse({
    status: 200,
    description: 'Return filtered Estimation for user',
  })
  async getEstimationsForUser(
    @Param('userId') userId: string,
    @Req() req: { user: RequestUser },   
    @Query() query: any,
  ) {
    const {
      branchId,
      firstname,
      lastname,
      email,
      phone,
      property_name,
      bhk,
      city,
      state,
      pincode,
      landmark,
      locality,
      page = 1,
      limit = 10,
      category,
    } = query;

    const cleanedCategory = category
      ? category.toString().trim().replace(/\?+$/, '')
      : undefined;

    const filters = {
      firstname,
      lastname,
      email,
      phone: phone ? Number(phone) : undefined,
      property_name,
      bhk,
      city,
      state,
      pincode,
      landmark,
      locality,
      category: cleanedCategory,
    };

    return this.costEstimatorService.fetchEstimationsByUser(
      req.user,                               
      filters,
      Number(page),
      Number(limit),
      branchId,
      userId,                                  
    );
  }
}

