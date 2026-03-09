import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import {
  CustomerDetailsDto,
  UpdateCustomerDetails,
  VerifyCustomerOtpDto,
  VerifyEmailDto,
} from './dto/customer.dto';
import { ServiceType } from '../service-required/enum/cb-service.enum';
import { PropertyType } from '../custom-property/enum/custom-property.enum';
import { PurposeType } from 'src/property/enums/property.enum';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // @UseGuards(ControllerAuthGuard)
  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify customer email/phone' })
  async verifyPhoneNumber(@Body() data: VerifyEmailDto): Promise<any> {
    return this.customerService.verifyEmail(data);
  }

  // @UseGuards(ControllerAuthGuard)
  @Post('verify-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify customer OTP' })
  async verifyOtp(@Body() data: VerifyCustomerOtpDto): Promise<any> {
    return this.customerService.verifyOtp(data);
  }

  // @UseGuards(ControllerAuthGuard)
  @Post('save-customer-details/:adminId')
  @HttpCode(201)
  @ApiOperation({ summary: 'Save customer details' })
  async saveCustomerDetails(
    @Body() customerDetails: CustomerDetailsDto,
    @Param('adminId') adminId: string,
  ): Promise<any> {
    return this.customerService.saveCustomerDetails(customerDetails, adminId);
  }

  // @UseGuards(ControllerAuthGuard)
  @Patch('update-customer-details')
  @HttpCode(201)
  @ApiOperation({ summary: 'Update customer details' })
  async updateCustomerDetails(
    @Body() updatecustomerDetails: UpdateCustomerDetails,
  ): Promise<any> {
    return this.customerService.updateCustomerDetails(updatecustomerDetails);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Find all customers' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'locality', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'serviceType', required: false, enum: ServiceType })
  @ApiQuery({ name: 'propertyType', required: false, enum: PropertyType })
  @ApiQuery({ name: 'constructionType', required: false, enum: PurposeType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllCustomers(
    @Query('name') name?: string,
    @Query('locality') locality?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('serviceType') serviceType?: ServiceType,
    @Query('propertyType') propertyType?: PropertyType,
    @Query('constructionType') constructionType?: PurposeType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return this.customerService.findAllCustomers(
      name,
      locality,
      state,
      city,
      serviceType,
      propertyType,
      constructionType,
      page,
      limit,
    );
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get customer by id' })
  async getCustomerDetailsById(
    @Param('id') id: string,
  ): Promise<any> {
    return this.customerService.getCustomerDetailsById( id);
  }

  @Get('/email/:email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Find customer by email' })
  async findOneCustomer(@Param('email') email: string): Promise<any> {
    return this.customerService.findOneCustomer(email);
  }

  // @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete customer' })
  async removeCustomer(@Param('id') id: string): Promise<any> {
    return this.customerService.removeCustomer(id);
  }
}
