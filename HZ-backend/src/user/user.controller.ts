import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  HttpCode,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ControllerAuthGuard, AdminPortal, Permissions } from 'src/guard';
import {
  CreateUserDto,
  UpdateUserDto,
  ReturnUserDto,
  userTokenReponse,
  ChangePasswordDto,
  LoginUserDto,
  CreateAdminUserWithBranchDto,
  ReturnAdminUserWithBranchDto,
  GetUsersFilterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SeedAdminDto,
} from './dto/user.dto';
import { AddressService } from 'src/Address/address.service';
import {
  GetAdminUsersOverviewFilterDto,
  UserOverviewResponseDto,
} from './dto/user-admin.dto';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users (with filter & sorting options)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users.',
    type: ReturnUserDto,
    isArray: true,
  })
  async findAll(@Query() query: GetUsersFilterDto): Promise<ReturnUserDto[]> {
    return this.userService.findAll(query);
  }

  @Get('admin/overview')
  @ApiOperation({
    summary: 'Get admin overview of all users with statistics',
    description:
      'Fetches users with their properties, orders, wishlist counts, etc. Filterable by branch.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users overview with statistics',
    type: UserOverviewResponseDto,
  })
  @HttpCode(200)
  async getAdminUsersOverview(
    @Query() filters: GetAdminUsersOverviewFilterDto,
  ): Promise<UserOverviewResponseDto> {
    return this.userService.getAdminUsersOverview(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: ReturnUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  // @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User is successfully created',
    type: CreateUserDto,
  })
  @HttpCode(201)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<userTokenReponse> {
    return this.userService.create(createUserDto);
  }

  //
  @Post('login-user')
  @ApiOperation({ summary: 'login successfully' })
  @ApiResponse({
    status: 201,
    description: 'user login successfully',
    type: CreateUserDto,
  })
  @HttpCode(201)
  async loginUser(
    @Body() createUserDto: LoginUserDto,
  ): Promise<userTokenReponse> {
    return this.userService.loginUser(createUserDto);
  }

  @Post('seed-admin')
  @ApiOperation({ summary: 'Create an admin user with ORG branch and SuperAdmin role' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @HttpCode(201)
  async seedAdmin(
    @Body() dto: SeedAdminDto,
  ): Promise<{ message: string; userId: string; branchId: string }> {
    return this.userService.seedAdmin(dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id/update-personal-info')
  @ApiOperation({ summary: 'Update personal info of a user' })
  @ApiResponse({
    status: 200,
    description: 'User personal information updated successfully',
    type: ReturnUserDto,
  })
  async updatePersonalInfo(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<ReturnUserDto> {
    return this.userService.updatePersonalInfo(id, UpdateUserDto);
  }
  // @UseGuards(ControllerAuthGuard)

  //new code for admin user creation — only business@houznext.com or users with user create permission
  @UseGuards(ControllerAuthGuard)
  @AdminPortal()
  @Permissions('user', 'create')
  @Post('admin/create-with-branch')
  @ApiOperation({
    summary: 'Create user and assign to a branch with roles (one-shot)',
  })
  @ApiResponse({
    status: 201,
    description: 'User and branch membership created',
  })
  @HttpCode(201)
  createAdminUserWithBranch(
    @Body() dto: CreateAdminUserWithBranchDto,
  ): Promise<ReturnAdminUserWithBranchDto> {
    return this.userService.createAdminUserWithBranch(dto);
  }

  // @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @HttpCode(204)
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') userId: string): Promise<{ message: string }> {
    return this.userService.remove(userId);
  }
  //change password
  @UseGuards(ControllerAuthGuard)
  @Post(':id/change-password')
  @ApiOperation({ summary: 'Change password of a user' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.userService.changePassword(id, changePasswordDto);
  }

  // Forgot Password - Request reset link
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent to email',
  })
  @HttpCode(200)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  // Reset Password - Set new password using token
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @HttpCode(200)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.resetPassword(resetPasswordDto);
  }

  //get address of a user
  @Get(':id/addresses')
  @ApiOperation({ summary: 'Get all addresses for a specific user' })
  @ApiResponse({ status: 200, description: 'List of addresses for the user' })
  async getUserAddresses(@Param('id') userId: string) {
    return this.addressService.findAllForUser(userId);
  }

  @Get(':userId/property-count')
  getUserPostedPropertyCount(@Param('userId') userId: string) {
    return this.userService.getPostedPropertyCount(userId);
  }
  // =============== UPDATE ADMIN USER WITH BRANCH BY BRANCH ID =================
  @UseGuards(ControllerAuthGuard)
  @AdminPortal()
  @Permissions('user', 'edit')
  @Patch('admin/update-with-branch/:userId')
  @ApiOperation({
    summary: 'Update user and branch membership details by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User and branch membership updated successfully',
    type: ReturnAdminUserWithBranchDto,
  })
  @HttpCode(200)
  async updateAdminUserWithBranch(
    @Param('userId') userId: string,
    @Body() dto: CreateAdminUserWithBranchDto,
  ): Promise<ReturnAdminUserWithBranchDto> {
    return this.userService.updateAdminUserWithBranch(userId, dto);
  }

  // =============== GET ALL ADMIN USERS BY BRANCH ID =================
  @UseGuards(ControllerAuthGuard)
  @AdminPortal()
  @Permissions('user', 'view')
  @Get('by-branch/:branchId/admin-users')
  @ApiOperation({ summary: 'Get all admin users assigned to a branch' })
  @ApiOkResponse({
    status: 200,
    type: ReturnAdminUserWithBranchDto,
    isArray: true,
  })
  @HttpCode(200)
  async getAdminUsersByBranchId(
    @Param('branchId') branchId: string,
  ): Promise<ReturnAdminUserWithBranchDto[]> {
    return this.userService.getAdminUsersByBranchId(branchId);
  }
}
