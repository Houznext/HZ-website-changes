import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CareerResponseDto,
  CreateCareerDto,
  CreateJobDepartmentDto,
  CreateJobRoleDto,
  DepartmentResponseDto,
  RoleResponseDto,
  UpdateCareerDto,
} from '../dto/career.dto';
import { CareerAdminService } from './careerAdmin.service';
import { ApplicationStatus } from '../enum/applicationStatus.enum';
import { UpdateStatusDto } from '../dto/applyCareer.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Career Administration') // Grouping under "Career Administration" tag in Swagger UI
@Controller('admin/careers')
export class CareerAdminController {
  constructor(private readonly careerService: CareerAdminService) {}

  // Specific Routes First

  // Specific Routes First

  @ApiOperation({ summary: 'Get all career Departments' })
  @ApiResponse({
    status: 200,
    description: 'List of all career departments',
    type: [DepartmentResponseDto],
  })
  @Get('/departments')
  async getAllDepartments(): Promise<any[]> {
    console.log('admin careers view all departments controller first line');
    return this.careerService.viewAllDepartments();
  }

  @ApiOperation({ summary: 'Get all Roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all career roles',
    type: [RoleResponseDto],
  })
  @Get('/roles')
  async getAllRoles(): Promise<RoleResponseDto[]> {
    return this.careerService.viewAllRoles();
  }

  @ApiOperation({ summary: 'Get all Roles By Department' })
  @ApiResponse({
    status: 200,
    description: 'List of roles in a specific department',
    type: [RoleResponseDto],
  })
  @Get('/department/:id')
  async getAllRolesByDepartment(
    @Param('id') id: number,
  ): Promise<RoleResponseDto[]> {
    return this.careerService.viewAllRolesByDepartment(id);
  }
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Create a new job department' })
  @ApiResponse({
    status: 201,
    description: 'Job department created successfully',
    type: DepartmentResponseDto,
  })
  @ApiBody({
    description: 'Details of the job department to create',
    type: CreateJobDepartmentDto,
  })
  @Post('/department')
  async createDepartment(
    @Body() createJobDepartmentDto: CreateJobDepartmentDto,
  ) {
    return this.careerService.createJobDepartment(createJobDepartmentDto);
  }
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Create a new job role' })
  @ApiResponse({
    status: 201,
    description: 'Job role created successfully',
    type: RoleResponseDto,
  })
  @ApiBody({
    description: 'Details of the job role to create',
    type: CreateJobRoleDto,
  })
  @Post('/jobRole')
  async createJobRole(@Body() createJobRoleDto: CreateJobRoleDto) {
    return this.careerService.createJobRole(createJobRoleDto);
  }

  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'List of all applications' })
  @Get('/applications')
  async getAllApplications() {
    return this.careerService.getAllApplications();
  }

  @ApiOperation({ summary: 'Get applications by user email' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email of the applicant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of applications for the provided email',
  })
  @Get('/applications/by-email')
  async getApplicationsByEmail(@Query('email') email: string) {
    if (!email) {
      throw new Error('Email is required');
    }
    return this.careerService.getApplicationsByEmail(email);
  }

  @ApiOperation({ summary: 'Get applications by status' })
  @ApiQuery({
    name: 'status',
    type: String,
    enum: ApplicationStatus,
    description: 'Status of the applications to filter by',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of applications filtered by status',
  })
  @Get('/applications/by-status')
  async getApplicationsByStatus(@Query('status') status: ApplicationStatus) {
    if (!status) {
      throw new Error('Status is required');
    }
    return this.careerService.getApplicationsByStatus(status);
  }

  @ApiOperation({ summary: 'Update the status of an application' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the application to update',
  })
  @ApiBody({
    description: 'Details of the status update',
    type: UpdateStatusDto,
  })
  @UseGuards(ControllerAuthGuard)
  @Patch(':id/status')
  async updateApplicationStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.careerService.updateApplicationStatus(
      id,
      updateStatusDto.status,
    );
  }

  // General Routes After Specific Routes
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Create a new career opportunity' })
  @ApiResponse({
    status: 201,
    description: 'Career opportunity created successfully',
    type: CareerResponseDto,
  })
  @ApiBody({
    description: 'Details of the career to create',
    type: CreateCareerDto,
  })
  @Post()
  async create(@Body() createCareerDto: CreateCareerDto) {
    return this.careerService.create(createCareerDto);
  }

  @ApiOperation({ summary: 'Get all career opportunities' })
  @ApiResponse({
    status: 200,
    description: 'List of all career opportunities',
    type: [CareerResponseDto],
  })
  @Get()
  async getAllCareers(): Promise<CareerResponseDto[]> {
    console.log('fetching careers');
    return this.careerService.viewAllCareers();
  }

  @ApiOperation({ summary: 'Get a specific career by ID' })
  @ApiResponse({
    status: 200,
    description: 'Career opportunity retrieved successfully',
    type: CareerResponseDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the career to retrieve',
  })
  @Get('/:id')
  async getCareer(@Param('id') id: number): Promise<CareerResponseDto> {
    return this.careerService.getCareer(id);
  }
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Update an existing career opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Career opportunity updated successfully',
    type: CareerResponseDto,
  })
  @ApiBody({
    description: 'Details of the career to update',
    type: UpdateCareerDto,
  })
  @Patch()
  async updateCareer(@Body() updateCareerDto: UpdateCareerDto) {
    return this.careerService.updateCareer(updateCareerDto);
  }
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Delete a career opportunity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Career opportunity deleted successfully',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the career to delete',
  })
  @Delete('/:id')
  async deleteCareer(@Param('id') id: number) {
    return this.careerService.deleteCareer(id);
  }
}
