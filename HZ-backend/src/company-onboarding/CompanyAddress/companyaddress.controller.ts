import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { AddressDto } from '../dto/company-onboarding.dto';
import { AddressService } from './companyaddress.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationDetails } from 'src/property/entities/location.entity';

@ApiTags('company-address')
@Controller('company-address/:companyId')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({
    summary: 'Add an address to a company',
    description: 'Creates and associates a new address with a company.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Address successfully created and associated with the company.',
    type: LocationDetails,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload.',
  })
  async addAddress(
    @Param('companyId') companyId: string,
    @Body() addressDto: AddressDto,
  ): Promise<LocationDetails> {
    return this.addressService.addAddressToCompany(companyId, addressDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all addresses of a company',
    description: 'Retrieves a list of all addresses associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of addresses retrieved successfully.',
    type: [LocationDetails],
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found or has no addresses.',
  })
  async getAddresses(
    @Param('companyId') companyId: string,
  ): Promise<LocationDetails[]> {
    return this.addressService.getAddressesOfCompany(companyId);
  }

  @Patch(':addressId')
  @ApiOperation({
    summary: 'Update an address of a company',
    description: 'Updates an existing address associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Address successfully updated.',
    type: LocationDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Address or company not found.',
  })
  async updateAddress(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
    @Body() addressDto: Partial<AddressDto>,
  ): Promise<LocationDetails> {
    return this.addressService.updateAddress(companyId, addressId, addressDto);
  }

  @Delete(':addressId')
  @ApiOperation({
    summary: 'Delete an address from a company',
    description: 'Deletes an address associated with a company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Address successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Address or company not found.',
  })
  async deleteAddress(
    @Param('companyId') companyId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.addressService.deleteAddress(companyId, addressId);
  }
}
