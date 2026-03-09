import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CompanyOnboardingService } from './company-onboarding.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Company } from './entities/company.entity';
import {
  CompanyDto,
  ProjectDto,
  SaveSellerDetailsDto,
  UpdateCompanyDto,
  UpdateProjectDto,
  updateSellerDetailsDto,
  VerifyDeveloperEmailDto,
  verifyDeveloperOtpDto,
  VerifySellerEmailDto,
  verifySellerOtpDto,
} from './dto/company-onboarding.dto';
import { Project } from './entities/company-projects.entity';
import { User } from 'src/user/entities/user.entity';
import { normalizeQueryParam } from 'src/property/utils/normalizeQueryParam';
import { PromotionUpdateDto } from 'src/property/dto/property.dto';
import {
  CompanyPromotionUpdateDto,
  ProjectFilterDto,
} from './dto/project.filter.dto';
import { ControllerAuthGuard } from 'src/guard';

@Controller('companyOnboarding')
@ApiTags('Company-Onboarding')
export class CompanyOnboardingController {
  constructor(
    private readonly companyOnboardingService: CompanyOnboardingService,
  ) {}

  @Get('/my-company/projects/:userid')
  @ApiOperation({
    summary: 'Get projects of logged-in builder',
    description:
      'Fetches all projects of the builder who is currently logged in.',
  })
  @ApiParam({
    name: 'userid',
    type: Number,
    required: true,
    description: 'The ID of the logged-in user',
    example: 19,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
  })
  async getMyProjects(@Param('userid') userid: string): Promise<Project[]> {
    const numericId = (userid);

    if (!numericId) {
      throw new BadRequestException('Invalid user ID in URL parameter');
    }

    return this.companyOnboardingService.getProjectsOfLoggedInBuilder(
      numericId,
    );
  }

  @UseGuards(ControllerAuthGuard)
  @Post('verify-developer-email')
  @ApiOperation({
    summary: 'Verify developer email',
    description:
      'Verifies the developer email and if already verified, returns a message.',
  })
  async verifyDeveloperEmail(@Body() params: VerifyDeveloperEmailDto) {
    return this.companyOnboardingService.verifyDeveloperEmail(params);
  }

  // verify developer otp
  @UseGuards(ControllerAuthGuard)
  @Post('verify-developer-otp')
  @ApiOperation({
    summary: 'Verify developer otp',
    description:
      'Verifies the developer otp and if verified, creates a company and links it with the developer.',
  })
  async verifyDeveloperOtp(@Body() params: verifyDeveloperOtpDto) {
    return this.companyOnboardingService.verifyDeveloperOtp(params);
  }
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Add a new company',
    description:
      'Update the company and developer created while verifying OTP and saves them to the database.',
  })
  async createCompany(@Body() companyDto: CompanyDto): Promise<Company> {
    return this.companyOnboardingService.addCompany(companyDto);
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':companyId')
  @ApiOperation({
    summary: 'Update a company',
    description: 'Updates an existing company with the provided details.',
  })
  async updateCompany(
    @Param('companyId') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companyOnboardingService.updateCompany(
      companyId,
      updateCompanyDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  //add projects to a company
  @Post('/:companyId/projects')
  @ApiOperation({
    summary: 'Add a project to a company',
    description: 'Adds a new project under an existing company.',
  })
  async addProjectToCompany(
    @Param('companyId') companyId: string,  
    @Body() projectDto: ProjectDto,
  ): Promise<Project> {
    return this.companyOnboardingService.addProjectToCompany(
      companyId,
      projectDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Patch('/projects/:projectId')
  @ApiOperation({
    summary: 'Update a project',
    description: 'Updates an existing project with the provided details.',
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.companyOnboardingService.updateProject(
      projectId,
      updateProjectDto,
    );
  }

  // Verify seller email
  @UseGuards(ControllerAuthGuard)
  @Post('/projects/verify-seller-email')
  @ApiOperation({
    summary: 'Verify seller email',
    description: 'Verifies the email of a seller.',
  })
  async verifySellerEmail(@Body() verifySellerEmailDto: VerifySellerEmailDto) {
    return this.companyOnboardingService.verifySellerEmail(
      verifySellerEmailDto,
    );
  }

  // Verify seller otp
  @UseGuards(ControllerAuthGuard)
  @Post('/projects/verify-seller-otp')
  @ApiOperation({
    summary: 'Verify seller otp',
    description: 'Verifies the otp of a seller.',
  })
  async verifySellerOtp(@Body() verifySellerOtpDto: verifySellerOtpDto) {
    return this.companyOnboardingService.verifySellerOtp(verifySellerOtpDto);
  }

  // Save seller details
  @UseGuards(ControllerAuthGuard)
  @Post('/projects/save-seller-details')
  @ApiOperation({
    summary: 'Save seller details',
    description: 'Saves the details of a seller.',
  })
  async saveSellerDetails(
    @Body() saveSellerDetailsDto: SaveSellerDetailsDto,
  ): Promise<User> {
    return this.companyOnboardingService.saveSellerDetails(
      saveSellerDetailsDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  // Update seller details
  @Put('/projects/update-seller-details')
  @ApiOperation({
    summary: 'Update seller details',
    description: 'Updates the details of a seller.',
  })
  async updateSellerDetails(
    @Body() updateSellerDetailsDto: updateSellerDetailsDto,
  ) {
    return this.companyOnboardingService.updateSellerDetails(
      updateSellerDetailsDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  // Delete seller
  @Delete('/projects/delete-seller')
  @ApiOperation({
    summary: 'Delete seller',
    description: 'Deletes a seller from a project.',
  })
  async deleteSeller(
    @Query('projectId') projectId: string,
    @Query('email') email: string,
  ) {
    return this.companyOnboardingService.deleteSeller({
      projectId: projectId,
      email,
    });
  }
  //get all the projects
  @Get('/get-all-projects')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllProjects(@Query() filter: ProjectFilterDto): Promise<{
    data: any[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    return this.companyOnboardingService.getAllProjects(filter);
  }

  //get all companies
  @Get('/companies')
  @ApiOperation({
    summary: 'Get all companies',
    description:
      'Fetches all companies with their associated developer information.',
  })
  async getAllCompanies(): Promise<Company[]> {
    return this.companyOnboardingService.getAllCompanies();
  }

  // Get all projects of a specific company
  @Get('/companies/:companyId/projects')
  @ApiOperation({
    summary: 'Get all projects of a company',
    description:
      'Fetches all projects of a specific company, including all associated relations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
  })
  async getAllProjectsOfCompany(
    @Param('companyId') companyId: string,
  ): Promise<Company> {
    return this.companyOnboardingService.getAllProjectsOfCompany(companyId);
  }

  //get company details
  @Get(':companyId')
  @ApiOperation({
    summary: 'Get all info a company',
    description: 'Fetches all the information of the developer information',
  })
  async fetchCompanyDetails(
    @Param('companyId') companyId: string,
  ): Promise<Company> {
    return this.companyOnboardingService.fetchCompanyDetails(companyId);
  }

  //get project details
  @Get('/projects/:projectId')
  @ApiOperation({
    summary: 'Get project details',
    description: 'Fetches all the information of the project',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
  })
  async fetchProjectDetails(
    @Param('projectId') projectId: string,
  ): Promise<Project> {
    return this.companyOnboardingService.fetchProjectDetails(projectId);
  }

  // Update promotion type
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id/promotion')
  @ApiOperation({
    summary: 'Update promotion details for a property',
    description:
      'Allows admin to set promotion type, expiry, and record who approved and updated the property.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Property ID',
  })
  async updatePromotionType(
    @Param('id') id: string,
    @Body() body: PromotionUpdateDto,
  ): Promise<Project> {
    return await this.companyOnboardingService.updatePromotionType(
      id,
      body.promotionType,
      body.promotionExpiry,
      body.approvedBy,
      body.updatedBy,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':companyId')
  @ApiOperation({
    summary: 'Delete a company and all associated projects and sellers',
    description:
      'Deletes the company, its projects, and all sellers associated with those projects.',
  })
  async deleteCompany(@Param('companyId') companyId: string) {
    return await this.companyOnboardingService.deleteCompany(companyId);
  }

  //update the promotionType of a project
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id/company-promotion')
  @ApiOperation({
    summary: 'Update promotion details for a company',
  })
  async updateCompanyPromotion(
    @Param('id') id: string,
    @Body() body: CompanyPromotionUpdateDto,
  ): Promise<Company> {
    return this.companyOnboardingService.updateCompanyPromotion(
      id,
      body.promotionType,
      body.promotionExpiry,
      body.updatedBy,
    );
  }
  @UseGuards(ControllerAuthGuard)
@Delete('/projects/:projectId')
@ApiOperation({
  summary: 'Delete a project',
  description:
    'Deletes a project and all its dependent relations (units, flooringPlans, location, mediaDetails, constructionStatus).',
})
@ApiParam({
  name: 'projectId',
  type: String,
  required: true,
  description: 'Project ID (uuid)',
})
async deleteProject(@Param('projectId') projectId: string) {
  return this.companyOnboardingService.deleteProject(projectId);
}


  // Get company status counts for admin dashboard
  @Get('/admin/counts')
  @ApiOperation({
    summary: 'Get Company Status Counts',
    description: 'Returns counts of companies by status for admin dashboard.',
  })
  async getCompanyStatusCounts(): Promise<{
    all: number;
    pending: number;
    approved: number;
    draft: number;
  }> {
    return await this.companyOnboardingService.getCompanyStatusCounts();
  }

  // Get all companies with filters for admin
  @Get('/admin/all')
  @ApiOperation({
    summary: 'Get All Companies for Admin',
    description: 'Fetches all companies with optional status filters.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'approved', 'draft'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllCompaniesForAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status: 'all' | 'pending' | 'approved' | 'draft' = 'all',
    @Query('search') search?: string,
  ): Promise<{
    data: Company[];
    total: number;
    currentPage: number;
    totalPages: number;
    counts: { all: number; pending: number; approved: number; draft: number };
  }> {
    return await this.companyOnboardingService.adminGetAllCompaniesWithFilters(page, limit, status, search);
  }

  // Approve or reject a company
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/:id/approve')
  @ApiOperation({
    summary: 'Approve or reject a company',
    description: 'Allows admin to approve or reject a company listing.',
  })
  async approveCompany(
    @Param('id') id: string,
    @Body() body: {
      isApproved: boolean;
      isPosted?: boolean;
      approvedBy: string;
      rejectionReason?: string;
    },
  ): Promise<Company> {
    return await this.companyOnboardingService.approveCompany(
      id,
      body.isApproved,
      body.approvedBy,
      body.isPosted,
      body.rejectionReason,
    );
  }

  // Approve or reject a project
  @UseGuards(ControllerAuthGuard)
  @Patch('/admin/projects/:id/approve')
  @ApiOperation({
    summary: 'Approve or reject a project',
    description: 'Allows admin to approve or reject a project listing.',
  })
  async approveProject(
    @Param('id') id: string,
    @Body() body: {
      isApproved: boolean;
      isPosted?: boolean;
      approvedBy: string;
      rejectionReason?: string;
    },
  ): Promise<Project> {
    return await this.companyOnboardingService.approveProject(
      id,
      body.isApproved,
      body.approvedBy,
      body.isPosted,
      body.rejectionReason,
    );
  }
}
